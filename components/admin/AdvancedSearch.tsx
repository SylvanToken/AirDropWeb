'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  X,
  Clock,
  Loader2,
  History,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { SearchResult, SearchSuggestion, SearchHistoryEntry } from '@/lib/admin/search';

interface AdvancedSearchProps {
  model: 'user' | 'task' | 'completion' | 'campaign';
  onResultSelect?: (result: any) => void;
  placeholder?: string;
  className?: string;
}

export default function AdvancedSearch({
  model,
  onResultSelect,
  placeholder = 'Search...',
  className = '',
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [executionTime, setExecutionTime] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Load search history on mount
  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const response = await fetch('/api/admin/search/history');
      if (response.ok) {
        const data = await response.json();
        setSearchHistory(data.history);
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  const fetchSuggestions = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/admin/search/autocomplete?model=${model}&query=${encodeURIComponent(
          query
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  }, [model, query]);

  // Debounced autocomplete
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, fetchSuggestions]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);

    try {
      const response = await fetch('/api/admin/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          query: searchQuery,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
        setTotalResults(data.total);
        setExecutionTime(data.executionTime);
        setShowResults(true);
        
        // Reload history to include new search
        loadSearchHistory();
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions.length > 0) {
        // Select suggestion
        const suggestion = suggestions[selectedIndex];
        handleSuggestionClick(suggestion);
      } else {
        // Perform search
        performSearch(query);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setShowResults(false);
      setSelectedIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'field') {
      setQuery(suggestion.text);
      inputRef.current?.focus();
    } else if (suggestion.type === 'operator') {
      setQuery((prev) => `${prev} ${suggestion.text} `);
      inputRef.current?.focus();
    } else {
      setQuery(suggestion.text);
      performSearch(suggestion.text);
    }
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleHistoryClick = (entry: SearchHistoryEntry) => {
    setQuery(entry.query);
    performSearch(entry.query);
    setShowHistory(false);
  };

  const deleteHistoryEntry = async (entryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(
        `/api/admin/search/history?id=${entryId}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        setSearchHistory((prev) => prev.filter((entry) => entry.id !== entryId));
      }
    } catch (error) {
      console.error('Failed to delete history entry:', error);
    }
  };

  const clearHistory = async () => {
    try {
      const response = await fetch('/api/admin/search/history', {
        method: 'DELETE',
      });
      if (response.ok) {
        setSearchHistory([]);
        setShowHistory(false);
      }
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  const highlightMatch = (text: string) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.length >= 2) {
              setShowSuggestions(true);
            } else if (searchHistory.length > 0) {
              setShowHistory(true);
            }
          }}
          placeholder={placeholder}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                setQuery('');
                setResults([]);
                setShowResults(false);
                setShowSuggestions(false);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {searchHistory.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="h-3 w-3" />
            </Button>
          )}
          {isSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </div>

      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <Card
          ref={suggestionsRef}
          className="absolute top-full mt-2 w-full z-50 shadow-lg"
        >
          <ScrollArea className="max-h-[300px]">
            <div className="p-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors ${
                    index === selectedIndex ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {suggestion.type === 'field' && (
                      <Badge variant="outline" className="text-xs">
                        Field
                      </Badge>
                    )}
                    {suggestion.type === 'operator' && (
                      <Badge variant="outline" className="text-xs">
                        Op
                      </Badge>
                    )}
                    <span className="font-medium">{highlightMatch(suggestion.text)}</span>
                  </div>
                  {suggestion.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {suggestion.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Search History */}
      {showHistory && searchHistory.length > 0 && (
        <Card className="absolute top-full mt-2 w-full z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Searches
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="h-6 text-xs"
              >
                Clear all
              </Button>
            </div>
          </CardHeader>
          <ScrollArea className="max-h-[300px]">
            <div className="px-4 pb-4 space-y-1">
              {searchHistory.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => handleHistoryClick(entry)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{entry.query}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.resultCount} results •{' '}
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => deleteHistoryEntry(entry.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Search Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Results
            </DialogTitle>
            <DialogDescription>
              Found {totalResults} results in {executionTime}ms for "{query}"
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No results found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search query or using different keywords
                </p>
              </div>
            ) : (
              <div className="space-y-3 p-4">
                {results.map((result, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      if (onResultSelect) {
                        onResultSelect(result.item);
                      }
                      setShowResults(false);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          {/* Display highlighted fields */}
                          {Object.entries(result.highlights).map(
                            ([field, highlightedValue]) => (
                              <div key={field}>
                                <p className="text-xs text-muted-foreground capitalize mb-1">
                                  {field}
                                </p>
                                <div
                                  className="text-sm"
                                  dangerouslySetInnerHTML={{
                                    __html: highlightedValue,
                                  }}
                                />
                              </div>
                            )
                          )}

                          {/* Display matched fields */}
                          {result.matchedFields.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {result.matchedFields.map((field) => (
                                <Badge
                                  key={field}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="outline" className="gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {result.score}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Search Tips */}
      {query.length === 0 && !showHistory && (
        <div className="mt-2 text-xs text-muted-foreground">
          <p>
            <strong>Tips:</strong> Use field:value for specific searches (e.g.,
            email:john@example.com), "quotes" for exact phrases, AND/OR/NOT for
            complex queries
          </p>
        </div>
      )}
    </div>
  );
}
