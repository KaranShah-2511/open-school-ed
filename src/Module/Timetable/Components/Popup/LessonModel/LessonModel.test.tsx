import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import LessonModel from './LessonModel';

describe('<LessonModel />', () => {
  test('it should mount', () => {
    render(<LessonModel />);

    const lessonModel = screen.getByTestId('LessonModel');

    expect(lessonModel).toBeInTheDocument();
  });
});