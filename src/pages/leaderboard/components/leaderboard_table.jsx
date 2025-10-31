import TableHeader from '../components/table_header';
import TableRow from '../components/table_row';
import TableRowSkeleton from '../components/table_row_skeleton';
import '../style/leaderboard_table_style.css';

const LeaderboardTable = ({ data, startIndex, loggedInUser, itemsPerPage, loading = false }) => {
  if (loading) {
    return (
        <div className="table">
          <TableHeader />
          {Array.from({ length: 7 }).map((_, index) => (
              <TableRowSkeleton
                  key={index}
                  isEvenRow={index % 2 === 0}
                  isLoggedUser={index === 6}
              />
          ))}
        </div>
    );
  }

  const pageStartRank = startIndex + 1;
  const pageEndRank = startIndex + data.length;
  const userRankNum = loggedInUser ? Number(loggedInUser.rank) : null;
  const loggedUserInPage =
      loggedInUser &&
      userRankNum != null &&
      userRankNum >= pageStartRank &&
      userRankNum <= pageEndRank;

  const rowsToShow = loggedUserInPage ? data : data.slice(0, Math.max(0, itemsPerPage - 1));

  return (
      <div className="table">
        <TableHeader />
        {rowsToShow.map((item, index) => {
          const actualRank = startIndex + index + 1;
          const isEvenRow = index % 2 === 0;
          const isLoggedUserRow = loggedUserInPage && actualRank === userRankNum;

          return (
              <TableRow
                  key={item.id}
                  rank={isLoggedUserRow ? userRankNum : actualRank}
                  name={isLoggedUserRow ? loggedInUser.name : item.name}
                  grade={isLoggedUserRow ? loggedInUser.grade : item.grade}
                  isEvenRow={isEvenRow}
                  isLoggedUser={isLoggedUserRow}
              />
          );
        })}

        {!loggedUserInPage && loggedInUser && (
            <TableRow
                rank={userRankNum}
                name={loggedInUser.name}
                grade={loggedInUser.grade}
                isLoggedUser={true}
                isEvenRow={(itemsPerPage - 1) % 2 === 0}
            />
        )}
      </div>
  );
};

export default LeaderboardTable;
