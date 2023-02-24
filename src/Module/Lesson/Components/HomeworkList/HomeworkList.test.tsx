import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import HomeworkList from './HomeworkList';

describe('<HomeworkList />', () => {
  test('it should mount', () => {
    render(<HomeworkList />);

    const homeworkList = screen.getByTestId('HomeworkList');

    expect(homeworkList).toBeInTheDocument();
  });
});