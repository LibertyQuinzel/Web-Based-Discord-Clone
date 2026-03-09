import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean up existing data
  await prisma.directMessage.deleteMany();
  await prisma.message.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.serverMember.deleteMany();
  await prisma.server.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data');

  // Create users
  const users = [];
  const userPasswords = ['password123', 'password456', 'password789', 'password000'];

  for (let i = 0; i < 4; i++) {
    const hashedPassword = await bcrypt.hash(userPasswords[i], 12);
    const user = await prisma.user.create({
      data: {
        username: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        password: hashedPassword,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 1}`,
      },
    });
    users.push(user);
    console.log(`👤 Created user: ${user.username}`);
  }

  // Create servers
  const servers = [];
  const serverNames = [
    'General Chat',
    'Gaming Community', 
    'Study Group',
    'Tech Talk'
  ];

  for (let i = 0; i < serverNames.length; i++) {
    const server = await prisma.server.create({
      data: {
        name: serverNames[i],
        description: `A server for ${serverNames[i].toLowerCase()}`,
        icon: `https://api.dicebear.com/7.x/avataaars/svg?seed=server${i + 1}`,
        creatorId: users[i].id,
        members: {
          create: users.slice(0, Math.min(3, i + 2)).map((user, index) => ({
            userId: user.id,
            role: index === 0 ? 'admin' : 'member',
          })),
        },
      },
    });
    servers.push(server);
    console.log(`🏠 Created server: ${server.name}`);
  }

  // Create channels
  const channels = [];
  const channelTypes = ['text', 'text', 'voice', 'text'];
  const channelNames = [
    ['general', 'random', 'voice-chat', 'memes'],
    ['gaming', 'off-topic', 'gaming-voice', 'screenshots'],
    ['study-help', 'resources', 'study-voice', 'notes'],
    ['tech-news', 'programming', 'tech-voice', 'projects']
  ];

  for (let i = 0; i < servers.length; i++) {
    for (let j = 0; j < channelNames[i].length; j++) {
      const channel = await prisma.channel.create({
        data: {
          name: channelNames[i][j],
          type: channelTypes[j],
          topic: `Discussion about ${channelNames[i][j]}`,
          position: j,
          serverId: servers[i].id,
        },
      });
      channels.push(channel);
      console.log(`💬 Created channel: ${channel.name} in ${servers[i].name}`);
    }
  }

  // Create messages
  const messageTemplates = [
    'Hello everyone! 👋',
    'How is everyone doing today?',
    'Just joined the server, excited to be here!',
    'Anyone up for a game later?',
    'Check out this cool thing I found!',
    'Thanks for the help!',
    'Good morning! ☀️',
    'Night everyone! 🌙',
    'This server is awesome!',
    'Looking forward to chatting with you all!'
  ];

  for (let i = 0; i < channels.length; i++) {
    const channel = channels[i];
    const messageCount = Math.floor(Math.random() * 10) + 5; // 5-15 messages per channel

    for (let j = 0; j < messageCount; j++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomMessage = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
      
      const message = await prisma.message.create({
        data: {
          content: randomMessage,
          authorId: randomUser.id,
          channelId: channel.id,
        },
      });
      
      // Add some delay between messages for realistic timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    console.log(`📝 Created ${messageCount} messages in ${channel.name}`);
  }

  // Create some direct messages
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const dmCount = Math.floor(Math.random() * 5) + 2; // 2-6 DMs per pair
      
      for (let k = 0; k < dmCount; k++) {
        const sender = k % 2 === 0 ? users[i] : users[j];
        const receiver = k % 2 === 0 ? users[j] : users[i];
        const randomMessage = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
        
        await prisma.directMessage.create({
          data: {
            content: randomMessage,
            senderId: sender.id,
            receiverId: receiver.id,
          },
        });
      }
    }
  }
  console.log(`📨 Created direct messages`);

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Users: ${users.length}`);
  console.log(`   Servers: ${servers.length}`);
  console.log(`   Channels: ${channels.length}`);
  console.log(`   Messages: ${await prisma.message.count()}`);
  console.log(`   Direct Messages: ${await prisma.directMessage.count()}`);
  console.log('\n🔑 Test User Credentials:');
  users.forEach((user, index) => {
    console.log(`   ${user.username}: ${user.email} / ${userPasswords[index]}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
