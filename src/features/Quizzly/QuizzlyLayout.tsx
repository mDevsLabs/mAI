import { Flexbox } from 'react-layout-kit';
import { Outlet } from 'react-router-dom';

const QuizzlyLayout = () => {
  return (
    <Flexbox height={'100%'} width={'100%'} align={'center'} justify={'center'} style={{ background: 'var(--color-bg-layout)' }}>
      <Outlet />
    </Flexbox>
  );
};

export default QuizzlyLayout;
