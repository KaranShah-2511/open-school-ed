import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import URL from 'urijs';
import { Img } from 'react-image';
import _ from 'lodash';
import NoImage from '../../Assets/Images/Svg/no-image.svg';
import LoaderImage from '../../Assets/Images/Svg/loader-three-dots.svg';
import { useStateMounted } from '../../Core/Hooks';

const domains: any = {
  server: process.env.REACT_APP_API_ENDPOINT,
  public: process.env.PUBLIC_URL,
  static: ''
};

type ImageProps = {
  src: string;
  alt: string;
  title?: string;
  domain?: 'server' | 'public' | 'static';
  loading?: string;
  errorSrc?: string;
  errorDomain?: string;
  loaderSrc?: string;
  loaderDomain?: string;
  className?: string | undefined;
} & typeof defaultProps;

const propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  domain: PropTypes.oneOf(Object.keys(domains)),
  loading: PropTypes.oneOf(['lazy', 'eager']),
  errorSrc: PropTypes.string,
  errorDomain: PropTypes.oneOf(Object.keys(domains)),
  loaderSrc: PropTypes.string,
  loaderDomain: PropTypes.oneOf(Object.keys(domains)),
};

const defaultProps = {
  domain: 'public',
  loading: 'lazy',
  errorSrc: NoImage,
  errorDomain: 'static',
  loaderSrc: LoaderImage,
  loaderDomain: 'static'
};

function Loader(props: any) {
  return (
    <>
      {
        (props.src)
          ? <img src={props.src} alt={props.alt} {...props} />
          : null
      }
    </>
  );
}

function Image(props: ImageProps) {

  const { src } = props;
  const initStateData = { src: null, alt: '', title: '', errorSrc: null, loaderSrc: null, imgProps: {} };
  const [state, setState] = useStateMounted<any>(initStateData);

  useEffect(() => {
    setState(initStateData);
    const srcUrl = (_src: string, domain: string) => {
      if (!_src) { return _src; }
      const host = domains[domain];
      let url = URL(_src);
      if (url.is('relative')) {
        url = url.absoluteTo(host);
      }
      return url.toString();
    }
    const params: any = {};
    params.src = srcUrl(props.src, props.domain);
    params.alt = props.alt;
    params.title = props.title;
    params.errorSrc = srcUrl(props.errorSrc, props.errorDomain);
    params.loaderSrc = srcUrl(props.loaderSrc, props.loaderDomain);
    params.imgProps = _.omit(props, ['src', 'alt', 'domain', 'errorSrc', 'errorDomain', 'loaderSrc', 'loaderDomain']);
    if (!('loading' in HTMLImageElement.prototype)) {
      params.imgProps = _.omit(params.imgProps, ['loading']);
    }
    setState(params);
    return () => {
      setState(initStateData);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return (
    <>
      {
        (state && state.src)
          ? <Img src={state.src} alt={state.alt} title={state.title} className={state.imgProps?.className}
            loader={<Loader src={state.loaderSrc} alt={state.alt} {...state.imgProps} data-loadsrc={state.src} />}
            unloader={<Loader src={state.errorSrc} alt={state.alt} {...state.imgProps} data-error={state.src} />} />
          : null
      }
    </>
  );
}

Image.propTypes = propTypes;

Image.defaultProps = defaultProps;

export default Image;