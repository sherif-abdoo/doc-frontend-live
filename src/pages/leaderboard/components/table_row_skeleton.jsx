import React from 'react';
import { Skeleton } from '@mui/material';
import '../style/table_row_style.css';

const TableRowSkeleton = ({ isEvenRow, isLoggedUser = false }) => {
  const rowClass = isLoggedUser
    ? 'table-row logged-user skeleton-row'
    : `table-row ${isEvenRow ? 'even' : 'odd'} skeleton-row`;

  return (
    <div className={rowClass}>
      <div className="col rank">
        <Skeleton 
          variant="text" 
          width={30} 
          height={24}
          sx={{ fontSize: '1rem' }}
        />
      </div>
      <div className="col name">
        <Skeleton 
          variant="text" 
          width={isLoggedUser ? '80%' : '70%'} 
          height={24}
          sx={{ fontSize: '1rem' }}
        />
      </div>
      <div className="col grade">
        <Skeleton 
          variant="text" 
          width={40} 
          height={24}
          sx={{ fontSize: '1rem' }}
        />
      </div>
    </div>
  );
};

export default TableRowSkeleton;