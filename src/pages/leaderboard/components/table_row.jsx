import '../style/table_row_style.css';

const TableRow = ({ rank, name, grade, isEvenRow, isLoggedUser = false }) => {
  const rowClass = isLoggedUser
    ? 'table-row logged-user'
    : `table-row ${isEvenRow ? 'even' : 'odd'}`;

  return (
    <div className={rowClass}>
      <div className="col rank">{rank}</div>
      <div className="col name">{name}</div>
      <div className="col grade">{grade}</div>
    </div>
  );
};

export default TableRow;