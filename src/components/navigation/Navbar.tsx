import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { FaHome, FaShoppingCart, FaUser, FaListAlt } from 'react-icons/fa';

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
    <div className="flex sticky bottom-0 w-full">
      <Menubar className="p-8 w-full justify-evenly">
        {menuItems.map((menu, index) => (
          <MenubarMenu key={index}>
            <MenubarTrigger className="flex flex-col">
            <a href={menu.path} className="flex items-center w-full p-2">
                <span>{menu.icon} {menu.label}</span>
              </a>
            </MenubarTrigger>
          </MenubarMenu>
        ))}
      </Menubar>
    </div>
  );
};

export default Navbar;