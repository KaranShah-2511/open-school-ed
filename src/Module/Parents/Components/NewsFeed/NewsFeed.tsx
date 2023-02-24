import React, { useEffect } from 'react';
import { useInfiniteScroll, useStateMounted } from '../../../../Core/Hooks';
import { GlobalMessage, GlobalMessageService } from '../../../../Services/GlobalMessageService';
import { useAuth } from '../../../../Core/Providers/AuthProvider';
import { Table } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import { Helmet } from 'react-helmet-async';
import moment from 'moment';
import './NewsFeed.scss';


function NewsFeed() {

  const [isScroll, setScroll] = useInfiniteScroll(0);
  const [nextPage, setNextPage] = useStateMounted<number | boolean>(false);
  const [search, setSearch] = useStateMounted<object>({ Searchby: '', Filterby: '-1', limit: 20 });
  const [loading, setLoading] = useStateMounted<boolean>(true);
  const [error, setError] = useStateMounted<string | null>(null);
  const [myGlobalMessages, setMyGlobalMessages] = useStateMounted<GlobalMessage[]>([]);
  const globelMessageService = new GlobalMessageService();
  const user = useAuth().user();

  useEffect(() => {
    (async () => {
      await getParentGlobalMessage(search);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  useEffect(() => {
    if (!isScroll) return;
    if (!nextPage) {
      setScroll(false);
      return;
    }
    setSearch((prevSearch) => {
      return { ...prevSearch, page: nextPage };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScroll, nextPage]);


  const getParentGlobalMessage = async (search) => {
    setLoading(true);
    setError(null);
    await globelMessageService
      .getParentMessage(user.MobileNumber, search)
      .then((res) => {
        setMyGlobalMessages((prevGlobalMessages) => {
          return [...prevGlobalMessages, ...res.messages];
        });
        setNextPage(res.pagination.nextPage);
      })
      .catch((e) => {
        if (e.type === 'client') {
          setError(e.message);
        } else {
          setError('System error occurred!! please try again.');
        }
      })
      .finally(() => {
        setLoading(false);
        setScroll(false);
      });
  };

  const LoadingSkeleton = (props) => {
    return <>
      {
        [...Array(props.row)].map((j, i) => {
          return (
            <tr key={i}>
              <td><Skeleton containerClassName="skeleton" inline={true} width="90%" /></td>
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
              <td><Skeleton containerClassName="skeleton" inline={true} width="80%" /></td>
            </tr>
          );
        })
      }
    </>
  };

  return (
    <>
      <Helmet>
        <title>News Feed</title>
      </Helmet>
      <div className="app-global-message-list">
        <Table responsive className="list-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Message</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {(loading && (!isScroll && !nextPage)) ? <LoadingSkeleton row={8} /> : null}
            {(error) ? <tr><td colSpan={8} style={{ width: '100%' }}>{error}</td></tr> : null}
            {
              (!loading && !error && (myGlobalMessages && myGlobalMessages && myGlobalMessages.length === 0))
                ? <tr><td colSpan={8} style={{ width: '100%' }}>Not record found</td></tr>
                : null
            }
            {
              (!error && (myGlobalMessages && myGlobalMessages && myGlobalMessages.length))
                ? (
                  myGlobalMessages.map((globelMessage, i) => {
                    return (
                      <tr key={i}>
                        <td>{globelMessage.Title}</td>
                        <td>{globelMessage.Message}</td>
                        <td>{moment(globelMessage.CreatedDate).format('DD/MM/YYYY')}</td>
                        {/* <td className={`status-${globelMessage.Status}` ? 'Sent' : 'Draft'}>{(globelMessage.Status === 'Sent') ? 'Sent' : 'Draft'}</td> */}
                      </tr>
                    );
                  })
                )
                : null
            }
            {(isScroll && nextPage) ? <LoadingSkeleton row={5} /> : null}
          </tbody>
        </Table>
      </div>
    </>
  );
}
export default NewsFeed
