import { Flex } from 'antd';
import { Outlet } from 'react-router-dom';

const QuizzlyLayout = () => {
  return (
    <Flex style={{ height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-layout)' }}>
      <Outlet />
    </Flex>
  );
};

export default QuizzlyLayout;
