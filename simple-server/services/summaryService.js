const { pool } = require('../config/database');

/**
 * Mocked LLM summarization provider.
 *
 * In production this would call an external API (e.g. Groq / OpenAI).
 * The assignment requires external service calls to be mocked in P4;
 * in P5 the mock can be replaced with a real Groq integration using
 * AWS credits.
 */
class SummarizationProvider {
  /**
   * Generate a natural-language summary of a set of messages.
   * Returns { overview, keyTopics, questionsAsked, decisionsMarked }.
   */
  static async summarize(messages, authorMap) {
    if (!messages || messages.length === 0) {
      return {
        overview: 'No messages found in this time range.',
        keyTopics: [],
        questionsAsked: 0,
        decisionsMarked: 0,
      };
    }

    const questions = messages.filter((m) => m.content.includes('?'));
    const decisions = messages.filter((m) => {
      const c = m.content.toLowerCase();
      return (
        c.includes('decided') ||
        c.includes('let\'s') ||
        c.includes('agreed') ||
        c.includes('will do') ||
        c.includes('confirmed')
      );
    });

    const topics = SummarizationProvider._extractTopics(messages);
    const overview = SummarizationProvider._buildOverview(
      messages,
      authorMap,
      topics,
      questions.length,
      decisions.length
    );

    return {
      overview,
      keyTopics: topics,
      questionsAsked: questions.length,
      decisionsMarked: decisions.length,
    };
  }

  /**
   * Generate a short one-line preview suitable for "What You Missed".
   */
  static async preview(messages, authorMap) {
    if (!messages || messages.length === 0) {
      return 'No recent messages.';
    }

    const authorCounts = {};
    messages.forEach((m) => {
      authorCounts[m.author_id] = (authorCounts[m.author_id] || 0) + 1;
    });

    const sorted = Object.entries(authorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const parts = [];
    if (sorted.length > 0) {
      const active = sorted.map(([authorId, count]) => {
        const name = authorMap[authorId] || 'Someone';
        return `${name} (${count} msg${count !== 1 ? 's' : ''})`;
      });

      if (active.length === 1) parts.push(`${active[0]} shared updates`);
      else if (active.length === 2)
        parts.push(`${active[0]} and ${active[1]} were active`);
      else parts.push(`${active[0]}, ${active[1]}, and ${active[2]} were active`);
    }

    const mentionCount = messages.reduce((acc, m) => {
      const matches = m.content.match(/@\w+/g);
      return acc + (matches ? matches.length : 0);
    }, 0);
    if (mentionCount > 0)
      parts.push(`${mentionCount} @mention${mentionCount === 1 ? '' : 's'}`);

    return (
      parts.join(' · ') ||
      `${messages.length} new message${messages.length === 1 ? '' : 's'}`
    );
  }

  // --- helpers ---------------------------------------------------------------

  static _extractTopics(messages) {
    const wordFreq = {};
    const stopWords = new Set([
      'the','a','an','is','are','was','were','be','been','being','have','has',
      'had','do','does','did','will','would','could','should','may','might',
      'shall','can','need','dare','to','of','in','for','on','with','at','by',
      'from','as','into','through','during','before','after','above','below',
      'between','out','off','over','under','again','further','then','once',
      'here','there','when','where','why','how','all','each','every','both',
      'few','more','most','other','some','such','no','nor','not','only','own',
      'same','so','than','too','very','just','about','i','you','he','she','it',
      'we','they','me','him','her','us','them','my','your','his','its','our',
      'their','this','that','these','those','am','and','but','or','if','while',
      'because','until','what','which','who','whom','whose','don\'t','i\'m',
      'i\'ll','it\'s','let\'s','hey','yeah','ok','okay','sure','thanks',
    ]);

    messages.forEach((m) => {
      const words = m.content
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 3 && !stopWords.has(w));

      words.forEach((w) => {
        wordFreq[w] = (wordFreq[w] || 0) + 1;
      });
    });

    return Object.entries(wordFreq)
      .filter(([, count]) => count >= 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([word]) => word);
  }

  static _buildOverview(messages, authorMap, topics, questionCount, decisionCount) {
    const uniqueAuthors = [...new Set(messages.map((m) => m.author_id))];
    const authorNames = uniqueAuthors
      .slice(0, 4)
      .map((id) => authorMap[id] || 'Someone');

    let authorsPhrase;
    if (authorNames.length === 1) authorsPhrase = authorNames[0];
    else if (authorNames.length === 2)
      authorsPhrase = `${authorNames[0]} and ${authorNames[1]}`;
    else {
      const rest = authorNames.slice(0, -1).join(', ');
      authorsPhrase = `${rest}, and ${authorNames[authorNames.length - 1]}`;
    }
    if (uniqueAuthors.length > 4)
      authorsPhrase += ` and ${uniqueAuthors.length - 4} other${uniqueAuthors.length - 4 !== 1 ? 's' : ''}`;

    const parts = [
      `${authorsPhrase} exchanged ${messages.length} message${messages.length !== 1 ? 's' : ''}.`,
    ];

    if (topics.length > 0)
      parts.push(`Key topics included ${topics.slice(0, 3).join(', ')}.`);

    if (questionCount > 0)
      parts.push(`${questionCount} question${questionCount !== 1 ? 's were' : ' was'} asked.`);

    if (decisionCount > 0)
      parts.push(`${decisionCount} decision${decisionCount !== 1 ? 's were' : ' was'} noted.`);

    return parts.join(' ');
  }
}

class SummaryService {
  /**
   * Fetch messages within a time window and produce a full summary.
   *
   * @param {string}  channelId  - Channel to summarize (mutually exclusive with dmId)
   * @param {string}  dmId       - DM to summarize
   * @param {number}  hours      - Hours to look back (default 3)
   * @param {number}  maxMessages - Cap on messages sent to the summarizer
   * @returns {Promise<object>}  SummaryData matching the frontend interface
   */
  static async generateManualSummary({ channelId, dmId, hours = 3, maxMessages = 200 }) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const { messages, authorMap } = await SummaryService._fetchMessages({
      channelId,
      dmId,
      since,
      limit: maxMessages,
    });

    const fmtDate = (d) =>
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const fmtTime = (d) =>
      d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const now = new Date();
    const timeframe = `${fmtDate(since)} ${fmtTime(since)} – ${fmtDate(now)} ${fmtTime(now)}`;

    if (messages.length === 0) {
      return {
        overview: 'No messages found in this time range.',
        keyTopics: [],
        mostActiveUsers: [],
        importantMessages: [],
        timeframe,
        stats: { totalMessages: 0, uniqueUsers: 0, questionsAsked: 0, decisionsMarked: 0 },
      };
    }

    const llmResult = await SummarizationProvider.summarize(messages, authorMap);

    const userCounts = {};
    messages.forEach((m) => {
      userCounts[m.author_id] = (userCounts[m.author_id] || 0) + 1;
    });

    const mostActiveUsers = Object.entries(userCounts)
      .map(([userId, count]) => ({
        username: authorMap[userId] || 'Unknown',
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const importantMessages = messages
      .filter((m) => {
        const c = m.content.toLowerCase();
        return (
          c.includes('important') ||
          c.includes('urgent') ||
          c.includes('bug') ||
          c.includes('ready for review') ||
          c.includes('📢') ||
          c.includes('🎯')
        );
      })
      .slice(0, 5)
      .map((m) => ({
        id: m.id,
        content: m.content,
        authorId: m.author_id,
        channelId: m.channel_id || undefined,
        dmId: m.dm_id || undefined,
        timestamp: m.timestamp,
        edited: !!m.edited,
      }));

    const uniqueUsers = new Set(messages.map((m) => m.author_id));

    return {
      overview: llmResult.overview,
      keyTopics: llmResult.keyTopics,
      mostActiveUsers,
      importantMessages,
      timeframe,
      stats: {
        totalMessages: messages.length,
        uniqueUsers: uniqueUsers.size,
        questionsAsked: llmResult.questionsAsked,
        decisionsMarked: llmResult.decisionsMarked,
      },
    };
  }

  /**
   * Generate a lightweight "What You Missed" preview.
   *
   * @param {string}  channelId
   * @param {string}  dmId
   * @param {string}  since - ISO timestamp of the user's last read position
   * @returns {Promise<object>} { summary, unreadCount, participants }
   */
  static async generatePreview({ channelId, dmId, since }) {
    const sinceDate = since ? new Date(since) : new Date(Date.now() - 60 * 60 * 1000);

    const { messages, authorMap } = await SummaryService._fetchMessages({
      channelId,
      dmId,
      since: sinceDate,
      limit: 100,
    });

    const summary = await SummarizationProvider.preview(messages, authorMap);

    const participantIds = [...new Set(messages.map((m) => m.author_id))];
    const participants = participantIds.slice(0, 4).map((id) => ({
      id,
      username: authorMap[id] || 'Unknown',
    }));

    return {
      summary,
      unreadCount: messages.length,
      participants,
      lastMessageTime: messages.length > 0 ? messages[messages.length - 1].timestamp : null,
    };
  }

  // --- internal helpers ------------------------------------------------------

  static async _fetchMessages({ channelId, dmId, since, limit = 200 }) {
    let query;
    let values;

    if (channelId) {
      query = `
        SELECT m.*, u.username, u.display_name
        FROM messages m
        JOIN users u ON m.author_id = u.id
        WHERE m.channel_id = $1 AND m.timestamp >= $2
        ORDER BY m.timestamp ASC
        LIMIT $3
      `;
      values = [channelId, since.toISOString(), limit];
    } else if (dmId) {
      query = `
        SELECT m.*, u.username, u.display_name
        FROM messages m
        JOIN users u ON m.author_id = u.id
        WHERE m.dm_id = $1 AND m.timestamp >= $2
        ORDER BY m.timestamp ASC
        LIMIT $3
      `;
      values = [dmId, since.toISOString(), limit];
    } else {
      return { messages: [], authorMap: {} };
    }

    const result = await pool.query(query, values);
    const messages = result.rows;

    const authorMap = {};
    messages.forEach((m) => {
      if (!authorMap[m.author_id]) {
        authorMap[m.author_id] = m.display_name || m.username;
      }
    });

    return { messages, authorMap };
  }
}

module.exports = { SummaryService, SummarizationProvider };
