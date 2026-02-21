import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Filter state interface
 */
export interface OrderFiltersState {
  search: string;
  debouncedSearch: string;
  status: string;
  orderType: string;
  paymentMethod: string;
  dateFilter: {
    startDate: string;
    endDate: string;
    quickFilter: string;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

/**
 * Pagination state interface
 */
export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
}

/**
 * Custom hook for managing order filters, pagination, and sorting
 * Consolidates complex state management from admin order pages
 */
export function useOrderFilters() {
  // Filter state
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [status, setStatus] = useState('all');
  const [orderType, setOrderType] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
    quickFilter: 'all'
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Sorting state
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, debouncedSearch, status, orderType, paymentMethod, dateFilter, sortBy, sortOrder]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort order if same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to desc
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (newDateFilter: typeof dateFilter) => {
    setDateFilter(newDateFilter);
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('all');
    setOrderType('all');
    setPaymentMethod('all');
    setDateFilter({
      startDate: '',
      endDate: '',
      quickFilter: 'all'
    });
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // Build query params for API calls
  const buildQueryParams = (): URLSearchParams => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: itemsPerPage.toString(),
    });

    if (debouncedSearch) params.append('search', debouncedSearch);
    if (status !== 'all') params.append('status', status);
    if (orderType !== 'all') params.append('orderType', orderType);
    if (paymentMethod !== 'all') params.append('paymentMethod', paymentMethod);
    if (dateFilter.startDate) params.append('startDate', dateFilter.startDate);
    if (dateFilter.endDate) params.append('endDate', dateFilter.endDate);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);

    return params;
  };

  return {
    // Filters
    filters: {
      search,
      debouncedSearch,
      status,
      orderType,
      paymentMethod,
      dateFilter,
      sortBy,
      sortOrder,
    },
    // Pagination
    pagination: {
      currentPage,
      itemsPerPage,
      totalPages,
      totalItems,
    },
    // Actions
    setSearch,
    setStatus,
    setOrderType,
    setPaymentMethod,
    setDateFilter: handleDateFilterChange,
    handleSort,
    handlePageChange,
    handleItemsPerPageChange,
    resetFilters,
    buildQueryParams,
    // Setters for pagination (from API response)
    setTotalPages,
    setTotalItems,
  };
}
