import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import NewsFeed from './NewsFeed';

describe('<NewsFeed />', () => {
  test('it should mount', () => {
    render(<NewsFeed />);

    const newsFeed = screen.getByTestId('NewsFeed');

    expect(newsFeed).toBeInTheDocument();
  });
});