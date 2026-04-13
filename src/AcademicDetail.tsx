import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

export const AcademicDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={id ? `/reports/child/${id}` : '/children'} replace />;
};
