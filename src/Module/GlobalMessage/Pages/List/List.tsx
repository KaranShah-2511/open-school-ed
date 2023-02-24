import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';
import { Helmet } from 'react-helmet-async';
import { Dropdown, Form, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaAngleRight } from "react-icons/fa";
import { useAuth } from '../../../../Core/Providers/AuthProvider';
import { useLayout } from '../../../../Core/Providers/LayoutProvider';
import { useInfiniteScroll, useStateMounted } from '../../../../Core/Hooks';
import { GlobalMessage, GlobalMessageService } from '../../../../Services/GlobalMessageService';
import { BsFunnel, BsPlusLg } from 'react-icons/bs';
import moment from 'moment';
import _, { debounce } from 'lodash';
import { RiSearchLine } from 'react-icons/ri';
import ImgNoMessage from '../../../../Assets/Images/Svg/no-message.svg';
import Image from '../../../../Components/Image';
import './List.scss';

function Heading() {
  return <>
    <h2 className="header-title">Global Messaging</h2>
  </>;
};


type AfterHeaderProps = {
  defaultSearch?: object;
  onSearch?: ((search: object) => void);
}

function AfterHeader(props: AfterHeaderProps) {

  const { defaultSearch, onSearch } = props;

  const [search, setSearch] = useStateMounted<any>();
  const [activeFilter, setActiveFilter] = useStateMounted("Date");

  const onSearchCall = (sparam) => {
    if (onSearch !== undefined) {
      onSearch(sparam);
    }
  }

  const onFilterBy = async (key) => {
    if (search?.Filterby !== key) {
      setActiveFilter(key.charAt(0).toUpperCase() + key.slice(1));
      setSearch((prevSearch) => {
        const data = { ...prevSearch, Filterby: key };
        onSearchCall(data);
        return data
      });
    }
  }

  const changeSearchby = (e) => {
    if (search?.Searchby !== e.target.value.trim()) {
      setSearch((prevSearch) => {
        return { ...prevSearch, Searchby: e.target.value.trim() };
      });
    }
  }

  const onSubmit = (e) => {
    e.preventDefault();
    onSearchCall(search);
  }

  useEffect(() => {
    setSearch(defaultSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSearch]);

  return <>
    <div className="app-header-tab-filter d-block">
      <div className="header-filter filter-other">
        <div className="filter-search" style={{ width: '75%' }}>
          <Form onSubmit={onSubmit}>
            <Form.Group className="filter-search-input" controlId="Searchby">
              <button type='submit' className="search-btn"><RiSearchLine /></button>
              <Form.Control
                placeholder="Search messages..."
                type="text"
                name="Searchby"
                onChange={changeSearchby}
                value={search?.Searchby || ''}
              // onChange={debounce(changeSearchby, 100)}
              />
            </Form.Group>
          </Form>
        </div>
        <div className="filter-by">
          <Dropdown className="filter-dropdown" onSelect={onFilterBy}>
            <Dropdown.Toggle variant="outline-secondary">By {activeFilter} <BsFunnel /></Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="Date" active={(search?.Filterby === "Date")}>Date</Dropdown.Item>
              <Dropdown.Item eventKey="Title" active={(search?.Filterby === "Title")}>Title</Dropdown.Item>
              <Dropdown.Item eventKey="Status" active={(search?.Filterby === "Status")}>Status</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <Link
          to={'/global-message/add'}
          state={{ returnTo: '/global-message' }}
          className='btn btn-success' type="button"><BsPlusLg /> New Message</Link>
      </div>
    </div>
  </>;
};

AfterHeader.propTypes = {
  defaultSearch: PropTypes.object,
  onSearch: PropTypes.func
};

function List() {

  const [isScroll, setScroll] = useInfiniteScroll(0);
  const [nextPage, setNextPage] = useStateMounted<number | boolean>(false);
  const [search, setSearch] = useStateMounted<object>({ Searchby: "", Filterby: "Date", page: "1", limit: "30" });
  const [loading, setLoading] = useStateMounted<boolean>(true);
  const [error, setError] = useStateMounted<string | null>(null);
  const [myGlobalMessages, setMyGlobalMessages] = useStateMounted<GlobalMessage[]>([]);
  const globelMessageService = new GlobalMessageService();
  const user = useAuth().user();
  const layout = useLayout();

  const onFilter = (sparam) => {
    const newSearch = _.pick(sparam, ['Searchby', 'Filterby', 'page', 'limit']);
    setMyGlobalMessages([]);
    setNextPage(false);
    setSearch(newSearch);
  }

  useEffect(() => {
    const heading = <><Heading /></>;
    const afterHeader = <>
      <AfterHeader
        defaultSearch={search}
        onSearch={onFilter}
      />
    </>;
    layout.clear().set({
      heading: heading,
      afterHeader: afterHeader,
      headerClass: 'app-inner',
      mainContentClass: 'app-inner',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, layout, search]);

  useEffect(() => {
    (async () => {
      await getGlobalMessages(search);
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

  const getGlobalMessages = async (search) => {
    setLoading(true);
    setError(null);
    let callback;
    if (user.userType.Type === 'school') {
      callback = globelMessageService.getBySchoolID(user.UserDetialId, search)
    } else {
      callback = globelMessageService.getByTeacherID(user.id, search)
    }
    await callback
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
        <title>Global Messaging</title>
      </Helmet>
      <div className="app-global-message-list">
        <Table responsive className="list-table">
          {(myGlobalMessages.length) ?
            <thead>
              <tr>
                <th>Message title</th>
                <th>Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            : null
          }
          <tbody>
            {(loading && (!isScroll && !nextPage)) ? <LoadingSkeleton row={8} /> : null}
            {(error) ? <tr><td colSpan={8} style={{ width: '100%' }}>{error}</td></tr> : null}
            {
              (!loading && !error && (myGlobalMessages && myGlobalMessages.length === 0))
                ? <tr><td colSpan={8} style={{ width: '100%' }}>
                  <div className="app-empty-screen">
                    <div className="app-empty-icon">
                      <Image src={ImgNoMessage} alt="Not record found" />
                    </div>
                    <div className="app-empty-content">
                      <h3>You have not sent any global messages yet</h3>
                      <p>Create and send a new message and it will show up here</p>
                    </div>
                  </div>
                </td></tr>
                : null
            }
            {
              (!error && (myGlobalMessages && myGlobalMessages.length))
                ? (
                  myGlobalMessages.map((globelMessage, i) => {
                    return (
                      <tr key={i}>
                        <td>{globelMessage.Title}</td>
                        <td>{moment(globelMessage.CreatedDate).format('DD/MM/YYYY')}</td>
                        <td className={`status-${globelMessage.Status}`}>{(globelMessage.Status === 'Sent') ? 'Sent' : 'Draft'}</td>
                        <td>
                          <Link
                            to={"/global-message/edit/" + globelMessage.id}
                            state={{ returnTo: '/global-message' }}><FaAngleRight /></Link>
                        </td>
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

export default List;
