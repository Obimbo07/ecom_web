import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { FaHome, FaShoppingCart, FaUser, FaListAlt } from 'react-icons/fa';
import { Link } from "react-router-dom";
// Updated menu items structure
const menuItems = [
  {
    label: 'Home',
    icon: <FaHome />,
    path: '/',
  },
  {
    label: 'Shop',
    icon: <FaListAlt />,
    path: '/shop',
  },
  {
    label: 'Cart',
    icon: <FaShoppingCart />,
    path: '/cart',
  },
  {
    label: 'Profile',
    icon: <FaUser />,
    path: '/profile',
  },
];

const Navbar = () => {
  return (
    <div className="w-full bg-gray-800 text-white sticky bottom-0 z-10">
      <Menubar className="w-full justify-around p-2 bg-gray-800 border-t border-gray-700 h-16">
        {menuItems.map((menu, index) => (
          <MenubarMenu key={index}>
            <MenubarTrigger className="flex flex-col items-center p-2 text-sm hover:bg-gray-700 rounded">
              <Link to={menu.path} className="flex flex-col items-center">
                <span className="text-xl">{menu.icon}</span>
                <span>{menu.label}</span>
              </Link>
            </MenubarTrigger>
          </MenubarMenu>
        ))}
      </Menubar>
    </div>
  );
};

export default Navbar;