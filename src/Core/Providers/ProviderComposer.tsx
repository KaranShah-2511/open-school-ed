/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

type ProviderComposerProps = {
  providers: any[];
  children: JSX.Element | JSX.Element[];
};

const provider = (provider: any, props = {}) => [provider, props];

const ProviderComposer = (props: ProviderComposerProps): JSX.Element => {
  let { providers, children } = props;
  const tProps = _.omit(props, ['providers', 'children']);
  if (providers) {
    providers = (_.isArray(providers)) ? providers : [providers];
    for (let i = providers.length - 1; i >= 0; --i) {
      const [Provider, pProps] = providers[i];
      const pcProps = _.merge(tProps, pProps)
      children = <Provider {...pcProps}>{children}</Provider>
    }
  }

  return <>{children}</>;
}

ProviderComposer.propTypes = {
  providers: PropTypes.array.isRequired
};

export { ProviderComposer, provider }