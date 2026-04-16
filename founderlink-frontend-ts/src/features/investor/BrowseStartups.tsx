import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../shared/components/Layout';
import StartupCard from '../../shared/components/StartupCard';
import {
  fetchStartups,
  setCurrentPage,
  selectStartups,
  selectStartupLoading,
  selectStartupError,
  selectTotalPages,
  selectTotalElements,
  selectCurrentPage,
} from '../../store/slices/startupSlice';
import useDebounce from '../../shared/hooks/useDebounce';
import useThrottle from '../../shared/hooks/useThrottle';
import { Startup } from '../../types';
import { AppDispatch } from '../../store/store';

const STAGES: string[] = ['All', 'IDEA', 'MVP', 'EARLY_TRACTION', 'SCALING'];
const PAGE_SIZE = 10;

const BrowseStartups: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector(selectStartups);
  const loading = useSelector(selectStartupLoading);
  const error = useSelector(selectStartupError);
  const totalPages = useSelector(selectTotalPages);
  const totalElements = useSelector(selectTotalElements);
  const currentPage = useSelector(selectCurrentPage);

  const [search, setSearch] = useState<string>('');
  const [stage, setStage] = useState<string>('All');
  const [location, setLocation] = useState<string>('');
  const debouncedSearch = useDebounce<string>(search, 400);
  const debouncedLocation = useDebounce<string>(location, 400);

  // Fetch from server whenever page changes
  useEffect(() => {
    dispatch(fetchStartups({ page: currentPage, size: PAGE_SIZE }));
  }, [dispatch, currentPage]);

  // Show toast on Redux error
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // Client-side filter on top of the current page data
  const filtered = useMemo(() => {
    let result = items;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (s: Startup) =>
          s.name.toLowerCase().includes(q) ||
          s.industry.toLowerCase().includes(q)
      );
    }
    if (stage !== 'All') result = result.filter((s: Startup) => s.stage === stage);
    if (debouncedLocation) {
      const loc = debouncedLocation.toLowerCase();
      result = result.filter((s: Startup) => s.location?.toLowerCase().includes(loc));
    }
    return result;
  }, [items, debouncedSearch, stage, debouncedLocation]);

  const handlePageChange = useThrottle((page: number): void => {
    dispatch(setCurrentPage(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 500);

  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);
    if (currentPage < 4) return [0, 1, 2, 3, 4, '...', totalPages - 1];
    if (currentPage > totalPages - 5) return [0, '...', totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1];
    return [0, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages - 1];
  };

  let resultsContent: React.ReactNode;
  if (loading) {
    resultsContent = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i: number) => (
          <div key={i} className="h-40 bg-dark-800 rounded-xl animate-pulse border border-dark-500" />
        ))}
      </div>
    );
  } else if (filtered.length === 0) {
    resultsContent = (
      <div className="card text-center py-14">
        <Search size={36} className="mx-auto text-gray-600 mb-3" />
        <p className="text-gray-300 font-medium">No startups found</p>
        <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
      </div>
    );
  } else {
    resultsContent = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((s: Startup) => (
          <StartupCard key={s.id} startup={s} />
        ))}
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Browse Startups</h1>
          <p className="text-gray-400 text-sm mt-1">
            {totalElements} startup{totalElements !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Search & filter bar */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={17} />
              <input
                className="input-field pl-10"
                placeholder="Search by name or industry..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={17} />
              <input
                className="input-field pl-10"
                placeholder="Filter by location..."
                value={location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {STAGES.map((s: string) => (
              <button
                key={s}
                onClick={() => setStage(s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  stage === s
                    ? 'bg-accent text-white'
                    : 'bg-dark-700 text-gray-400 hover:text-gray-200 border border-dark-400'
                }`}
              >
                {s === 'EARLY_TRACTION' ? 'Early Traction' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {resultsContent}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 pt-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            {getPageNumbers().map((p: number | string, idx: number) =>
              p === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-gray-600 text-sm select-none">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => handlePageChange(p as number)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                    p === currentPage
                      ? 'bg-accent text-white'
                      : 'text-gray-400 hover:text-white hover:bg-dark-700'
                  }`}
                >
                  {(p as number) + 1}
                </button>
              )
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <p className="text-center text-xs text-gray-600">
            Page {currentPage + 1} of {totalPages}
          </p>
        )}
      </div>
    </Layout>
  );
};

export default BrowseStartups;
