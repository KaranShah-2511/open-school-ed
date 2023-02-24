/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import React from 'react'
import { Observable, Subject } from 'rxjs';

interface LayoutContextInterface {
  set: Function;
  clear: Function;
  data: Observable<any>;
}

const LayoutContext = React.createContext<LayoutContextInterface | null>(null);

class LayoutProvider extends React.Component<{}, LayoutContextInterface> {

  subject = new Subject();

  data$ = {}

  store$ = {
    init: () => {
      this.subject.next(this.data$)
    },
    subscribe: (setState: any) => this.subject.subscribe(setState),
    set: (data: any) => {
      this.data$ = Object.assign(this.data$, data)
      this.subject.next(this.data$);
    },
    clear: () => {
      this.data$ = {};
      this.subject.next(this.data$);
      return this.state;
    },
    data: this.subject.asObservable()
  }

  constructor(props: any) {
    super(props)
    this.state = {
      set: this.store$.set,
      clear: this.store$.clear,
      data: this.store$.data
    };
    this.store$.subscribe(this.data$);
    this.store$.init();
  }

  render() {
    return (
      <LayoutContext.Provider value={this.state}>
        {this.props.children}
      </LayoutContext.Provider>
    )
  }
}

const LayoutConsumer = LayoutContext.Consumer

function useLayout() {
  const layout = React.useContext(LayoutContext)
  if (!layout) {
    throw new Error('useLayout must be used within a LayoutProvider.')
  }
  return layout;
}

export { LayoutProvider, LayoutConsumer, LayoutContext, useLayout }
