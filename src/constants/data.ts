import { Package } from '../types';

export const PACKAGES: Package[] = [
  {
    id: '1',
    name: 'Gói Cơ Bản',
    price: 150000,
    cupsPerDay: 1,
    duration: '30 ngày',
    benefits: ['1 ly cà phê/ngày', 'Miễn phí giao hàng', 'Hỗ trợ 24/7'],
    image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '2',
    name: 'Gói Tiêu Chuẩn',
    price: 300000,
    cupsPerDay: 2,
    duration: '30 ngày',
    benefits: ['2 ly cà phê/ngày', 'Miễn phí giao hàng', 'Hỗ trợ 24/7', 'Tặng 1 ly trong tuần đầu'],
    popular: true,
    image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '3',
    name: 'Gói Premium',
    price: 450000,
    cupsPerDay: 3,
    duration: '30 ngày',
    benefits: ['3 ly cà phê/ngày', 'Miễn phí giao hàng', 'Hỗ trợ 24/7', 'Cà phê premium', 'Tặng bánh ngọt'],
    image: 'https://images.pexels.com/photos/851555/pexels-photo-851555.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '4',
    name: 'Gói Gia Đình',
    price: 600000,
    cupsPerDay: 5,
    duration: '30 ngày',
    benefits: ['5 ly cà phê/ngày', 'Miễn phí giao hàng', 'Hỗ trợ 24/7', 'Cà phê premium', 'Tặng bánh ngọt', 'Ưu đãi gia đình'],
    image: 'https://images.pexels.com/photos/1580652/pexels-photo-1580652.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

export const BENEFITS = [
  {
    id: '1',
    title: 'Cà Phê Tươi Mỗi Ngày',
    description: 'Cà phê được rang mới và giao tận nơi hàng ngày',
    icon: 'coffee',
  },
  {
    id: '2',
    title: 'Tiết Kiệm Chi Phí',
    description: 'Tiết kiệm đến 30% so với mua lẻ',
    icon: 'piggy-bank',
  },
  {
    id: '3',
    title: 'Giao Hàng Miễn Phí',
    description: 'Miễn phí giao hàng trong nội thành',
    icon: 'truck',
  },
  {
    id: '4',
    title: 'Chất Lượng Đảm Bảo',
    description: 'Cà phê 100% Arabica cao cấp từ Đà Lạt',
    icon: 'award',
  },
  {
    id: '5',
    title: 'Linh Hoạt Thay Đổi',
    description: 'Có thể thay đổi gói hoặc tạm dừng bất kỳ lúc nào',
    icon: 'settings',
  },
  {
    id: '6',
    title: 'Hỗ Trợ 24/7',
    description: 'Đội ngũ hỗ trợ khách hàng nhiệt tình 24/7',
    icon: 'headphones',
  },
];