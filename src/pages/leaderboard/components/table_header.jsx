import '../style/table_header_style.css';

const TableHeader = () => (
  <div className="table-header">
    <div className="col rank">#</div>
    <div className="col name">Name</div>
    <div className="col grade">Grade</div>
  </div>
);

export default TableHeader;