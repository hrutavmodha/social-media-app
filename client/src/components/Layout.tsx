import Sidebar from './Sidebar';
import Widgets from './Widgets';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen max-w-7xl mx-auto">
      <Sidebar />
      <main className="flex-grow border-x border-gray-200">
        {children}
      </main>
      <Widgets />
    </div>
  );
};

export default Layout;
