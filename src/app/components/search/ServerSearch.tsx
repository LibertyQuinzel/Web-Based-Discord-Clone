import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';
import { Search, X } from 'lucide-react';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';

interface ServerSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ServerSearch: React.FC<ServerSearchProps> = ({ searchQuery, onSearchChange }) => {
  const { servers, setSelectedServer, setSelectedChannel, setSelectedDM } = useApp();
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const backendResults = await apiService.searchServers(searchQuery);
        setResults(backendResults);
      } catch (err) {
        console.error('Server search failed, falling back to local filter:', err);
        const local = servers.filter((s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setResults(
          local.map((s) => ({
            id: s.id,
            name: s.name,
            icon: s.icon,
            member_count: s.members.length,
          }))
        );
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, servers]);

  if (!searchQuery) return null;

  const handleSelect = (server: any) => {
    const fullServer = servers.find((s) => s.id === server.id);
    if (fullServer) {
      setSelectedServer(fullServer);
    } else {
      setSelectedServer({
        id: server.id,
        name: server.name,
        icon: server.icon || '📁',
        ownerId: server.owner_id || '',
        members: [],
      });
    }
    setSelectedChannel(null);
    setSelectedDM(null);
    onSearchChange('');
  };

  return (
    <div className="absolute top-14 left-2 right-2 bg-[#0a1628] border border-[#1e3248] rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden">
      <ScrollArea className="max-h-96">
        <div className="p-2">
          {isSearching ? (
            <div className="text-center text-[#475569] py-4 text-sm">Searching…</div>
          ) : results.length === 0 ? (
            <div className="text-center text-[#475569] py-4 text-sm">No spaces found</div>
          ) : (
            <div className="space-y-0.5">
              <div className="text-xs text-[#475569] uppercase font-semibold tracking-wider px-2 py-1">
                Spaces — {results.length}
              </div>
              {results.map((server) => (
                <button
                  key={server.id}
                  onClick={() => handleSelect(server)}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#1a2d45] text-left transition-colors"
                >
                  <div className="size-10 rounded-xl bg-[#060c18] border border-[#1e3248] flex items-center justify-center text-lg">
                    {server.icon || '📁'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#e2e8f0] text-sm font-medium truncate">{server.name}</div>
                    <div className="text-[#475569] text-xs">
                      {server.member_count ?? server.members?.length ?? 0} people
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

interface ServerSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const ServerSearchInput: React.FC<ServerSearchInputProps> = ({ value, onChange }) => {
  return (
    <div className="px-3 py-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-[#475569]" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search spaces..."
          className="pl-8 pr-8 bg-[#060c18] border border-[#1e3248] text-[#e2e8f0] placeholder:text-[#475569] text-sm h-8 focus-visible:ring-[#06b6d4]/50"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94a3b8]"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
};