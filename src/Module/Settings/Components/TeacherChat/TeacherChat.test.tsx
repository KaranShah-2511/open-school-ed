import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TeacherChat from './TeacherChat';

describe('<TeacherChat />', () => {
  test('it should mount', () => {
    render(<TeacherChat />);

    const teacherChat = screen.getByTestId('TeacherChat');

    expect(teacherChat).toBeInTheDocument();
  });
});