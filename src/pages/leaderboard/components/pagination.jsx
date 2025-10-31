import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@mui/material';
import '../style/pagination_style.css';

const Pagination = ({ currentPage, totalPages, onPageChange, loading = false }) => {
  if (loading) {
    return (
      <div className="pagination">
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width={30} height={40} />
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="circular" width={40} height={40} />
      </div>
    );
  }

  const getPaginationNumbers = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) range.push(i);

    if (currentPage - delta > 2) rangeWithDots.push(1, '...');
    else rangeWithDots.push(1);

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) rangeWithDots.push('...', totalPages);
    else if (totalPages > 1) rangeWithDots.push(totalPages);

    return rangeWithDots;
  };

  return (
    <div className="pagination">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        <ChevronLeft size={30} />
      </button>
      {getPaginationNumbers().map((pageNumber, index) =>
        pageNumber === '...' ? (
          <span key={index} className="dots">{pageNumber}</span>
        ) : (
          <button
            key={index}
            onClick={() => onPageChange(pageNumber)}
            className={pageNumber === currentPage ? 'active' : ''}
          >
            {pageNumber}
          </button>
        )
      )}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        <ChevronRight size={30} />
      </button>
    </div>
  );
};

export default Pagination;