import React, { useEffect } from "react";
import { Form, Table } from "react-bootstrap";
import { IoMdArrowBack } from "react-icons/io";
import { Link } from "react-router-dom";
import { Image } from "../../../../../Components";
import { useLayout } from "../../../../../Core/Providers";
import { useInfiniteScroll, useStateMounted } from "../../../../../Core/Hooks";
import PropTypes from "prop-types";
import { RiSearchLine } from "react-icons/ri";
import _ from "lodash";
import { useLocation, useNavigate } from "react-router";
import {
  ChannelData,
  TeacherService,
} from "../../../../../Services/TeacherService";
import Skeleton from "react-loading-skeleton";
import VideoPopUp from "../../../Components/Popup";
import { DataStore } from "../../../../../Core/Services/DataService";
import { checkPrimeSync } from "crypto";
import "./HomeWorkMaterial.scss";

type HeadingProps = {
  returnTo?: any;
};
function Heading(props: HeadingProps) {
  const { returnTo } = props;

  return (
    <>
      <h2 className="header-title">
        {returnTo ? (
          <Link to={returnTo}>
            <IoMdArrowBack />
          </Link>
        ) : null}
        Recommended Content
      </h2>
    </>
  );
}

Heading.propTypes = {
  loading: PropTypes.bool,
  returnTo: PropTypes.string,
};

type AfterHeaderProps = {
  defaultSearch?: object;
  onSearch?: (search: object) => void;
};

function AfterHeader(props: AfterHeaderProps) {
  const { defaultSearch, onSearch } = props;
  const [search, setSearch] = useStateMounted<any>();

  const onSearchCall = (sparam: object) => {
    if (onSearch !== undefined) {
      onSearch(sparam);
    }
  };

  const changeSearchby = (e: { target: { value: string } }) => {
    if (search?.Searchby !== e.target.value) {
      setSearch((prevSearch: any) => {
        return { ...prevSearch, Searchby: e.target.value };
      });
    }
  };

  const onSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    onSearchCall(search);
  };

  useEffect(() => {
    setSearch(defaultSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSearch]);

  return (
    <>
      <div className="app-header-tab-filter d-block">
        <div className="header-filter filter-other">
          <div style={{ width: "100%" }}>
            Our AI has shortlisted the following content to help you to deliver
            your lesson
          </div>
          <div className="filter-search" style={{ width: "74%" }}>
            <Form onSubmit={onSubmit}>
              <Form.Group className="filter-search-input" controlId="Searchby">
                <button type="submit" className="search-btn">
                  <RiSearchLine />
                </button>
                <Form.Control
                  placeholder="Search Subject,Class,etc..."
                  type="text"
                  name="Searchby"
                  autoComplete="off"
                  onChange={changeSearchby}
                  value={search?.Searchby || ""}
                />
              </Form.Group>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}

AfterHeader.propTypes = {
  defaultSearch: PropTypes.object,
  onSearch: PropTypes.func,
  setShowVideo: PropTypes.any,
};

function HomeWorkMaterial() {
  const dataService = DataStore;
  const [search, setSearch] = useStateMounted<object>({
    Searchby: "",
    Filterby: "",
    limit: 15,
  });
  const [loading, setLoading] = useStateMounted<boolean>(true);
  const location = useLocation();
  const returnTo =  
    (location.state as { returnTo: string })?.returnTo || "/lesson/add";
  const layout = useLayout();
  const [tmpHomework, setTmpHomework] = useStateMounted<any>();
  const [copyTmpHomework, setCopyTmpHomework] = useStateMounted<any>();
  const teacherService = new TeacherService();
  const [error, setError] = useStateMounted<string | null>(null);
  const [channels, setChannels] = useStateMounted<ChannelData[]>([]);
  const [nextPage, setNextPage] = useStateMounted<number | boolean>(false);
  const [showVideo, setShowVideo] = useStateMounted(false);
  const [videoData, sestVideoData] = useStateMounted();
  const [item, setItem] = useStateMounted<ChannelData>();
  const navigate = useNavigate();
  const [isScroll, setScroll] = useInfiniteScroll(0);

  const onFilter = (sparam: any) => {
    const newSearch = _.pick(sparam, ["Searchby", "Filterby", "limit"]);
    setSearch(newSearch);
    setChannels([]);
    setNextPage(false);
  };

  useEffect(() => {
    (async () => {
      await dataService
        .get("HOMEWORK_TMP")
        .then((tmpData) =>{
          setTmpHomework(tmpData);
          setCopyTmpHomework(tmpData);
        });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    if (tmpHomework) {
      dataService.set("HOMEWORK_TMP", tmpHomework);
    }
  }, [tmpHomework]);



  useEffect(() => {
    const heading = (
      <>
        <Heading returnTo={returnTo} />
      </>
    );
    const afterHeader = (
      <>
        <AfterHeader defaultSearch={search} onSearch={onFilter} />
      </>
    );

    layout.clear().set({
      heading: heading,
      afterHeader: afterHeader,
      mainContentClass: "app-inner",
      headerClass: "timetable-header app-inner",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, layout, returnTo, search]);

  useEffect(() => {
    (async () => {
      await getChannel(search);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, copyTmpHomework]);

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

  const getChannel = async (search) => {
    setLoading(true);
    setError(null);
    if (!copyTmpHomework) {
      return;
    }
    const tSearch = JSON.parse(JSON.stringify(search));
    if (!tSearch.Searchby) {
      tSearch.Searchby = [copyTmpHomework.SubjectText.Topic];
    }
    tSearch["SubjectBy"] = [copyTmpHomework.SubjectText.Subject];
    await teacherService
      .channelUser(tSearch)
      .then((res) => {
        setChannels((prevChannel) => {
          return [...prevChannel, ...res.channels];
        });
        setNextPage(res.pagination.nextPage);
      })
      .finally(() => {
        setLoading(false);
        setScroll(false);
      });
  };

  const handleClick = (item: ChannelData) => {
    setItem(item);
  };

  const handleInputChange = (event, channel) => {
    if (tmpHomework != undefined) {
      if (event.target.checked) {
        setTmpHomework((prevValues) => {
          return {
            ...prevValues,
            ChannelList: [...prevValues.ChannelList, { ...channel }],
          };
        });
      } else {
        setTmpHomework((prevValues) => {
          const channelList = prevValues.ChannelList.filter(
            (item: { id: any }) => {
              return item.id !== channel.id;
            }
          );
          return { ...prevValues, ChannelList: channelList };
        });
      }
    } else {
      navigate(returnTo);
    }
  };

  const LoadingSkeleton = (props) => {
    return (
      <>
        <ul>
          {[...Array(props.col)].map((j, i) => {
            return (
              <li key={i} className="skeleton">
                <div className="video-popup">
                  <Skeleton
                    containerClassName="skeleton"
                    inline={true}
                    height="100%"
                    style={{ borderRadius: "15px" }}
                  />
                </div>
                <span className="video-gallery-title">
                  <Skeleton
                    containerClassName="skeleton"
                    inline={true}
                    width="200px"
                    height="20px"
                  />
                </span>
              </li>
            );
          })}
        </ul>
      </>
    );
  };

  // const getThumbe = (channel: ChannelData) => {
  //   return "https://img.youtube.com/vi/" + channel.VideoId + "/mqdefault.jpg";
  // };

  const OpenVideo = (channel) => {
    setShowVideo(true);
    sestVideoData(channel);
  };

  const result: any = (data) => {
    if (tmpHomework) {
      let confirmation = tmpHomework.ChannelList.find(({ id }) => id === data);
      return confirmation ? true : false;
    } else {
      return false;
    }
  };

  return (
    <div className="app-material">
      <div className="video-gallery-main">
        {error ? (
          <tr>
            <td colSpan={9} style={{ width: "100%" }}>
              {error}
            </td>
          </tr>
        ) : null}
        {
          <React.Fragment>
            <h3>
              Videos
              {tmpHomework && tmpHomework.ChannelList.length
                ? `(${tmpHomework.ChannelList.length})`
                : ""}
            </h3>
            {loading && !isScroll && !nextPage ? (
              <LoadingSkeleton col={8} />
            ) : null}
            <ul>
              {channels.map((channel, key) => {
                // const videoLink = `https://www.youtube.com/embed/${channel.VideoId}`;

                return (
                  <li key={key}>
                    <div
                      className="video-popup"
                      onClick={() => OpenVideo(channel)}
                    >
                      {/* <Image src={getThumbe(channel)} alt="BBC Bitesize" /> */}
                    </div>

                    <Form.Check className="video-banner">
                      <Form.Check.Input
                        id={`${channel.id}`}
                        type="checkbox"
                        name="material"
                        checked={result(channel.id)}
                        onChange={(e) => handleInputChange(e, channel)}
                      />
                      <Form.Check.Label
                        htmlFor={`${channel.id}`}
                        onClick={() => handleClick(channel)}
                      >
                        {/* <iframe
                          src={videoLink}
                          frameBorder="0"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                          title="video"
                        /> */}
                      </Form.Check.Label>
                    </Form.Check>
                    <span className="video-gallery-title">{channel.Title}</span>
                  </li>
                );
              })}
            </ul>
          </React.Fragment>
        }
      </div>
      {showVideo ? (
        <VideoPopUp
          handleClose={setShowVideo}
          show={true}
          videoData={videoData}
        />
      ) : null}
    </div>
  );
}

export default HomeWorkMaterial;
