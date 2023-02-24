import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import LessonList from './LessonList';

describe('<LessonList />', () => {
  test('it should mount', () => {
    render(<LessonList />);

    const lessonList = screen.getByTestId('LessonList');

    expect(lessonList).toBeInTheDocument();
  });
});