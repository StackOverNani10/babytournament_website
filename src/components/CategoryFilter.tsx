import React from 'react';
import { Category } from '../types';
import * as Icons from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CategoryFilterProps {
  categories: Category[];
  selected: string;
  onSelect: (categoryId: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selected, onSelect }) => {
  const { selectedTheme } = useApp();
  
  const getThemeClasses = () => {
    switch (selectedTheme) {
      case 'boy':
        return {
          selected: 'bg-blue-600 text-white',
          unselected: 'bg-gray-100 text-gray-700 hover:bg-blue-50',
          border: 'border-blue-200',
          hover: 'hover:bg-blue-50',
          icon: 'text-blue-500'
        };
      case 'girl':
        return {
          selected: 'bg-pink-600 text-white',
          unselected: 'bg-gray-100 text-gray-700 hover:bg-pink-50',
          border: 'border-pink-200',
          hover: 'hover:bg-pink-50',
          icon: 'text-pink-500'
        };
      default:
        return {
          selected: 'bg-yellow-500 text-gray-900',
          unselected: 'bg-gray-100 text-gray-700 hover:bg-yellow-50',
          border: 'border-yellow-200',
          hover: 'hover:bg-yellow-50',
          icon: 'text-yellow-500'
        };
    }
  };
  
  const theme = getThemeClasses();
  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName];
    return Icon ? <Icon size={20} /> : null;
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect('all')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
          selected === 'all'
            ? `${theme.selected} shadow-md`
            : `${theme.unselected} ${theme.border} ${theme.hover} hover:shadow-sm`
        }`}
      >
        Todas
      </button>
      
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
            selected === category.id
              ? `${theme.selected} shadow-md`
              : `${theme.unselected} ${theme.border} ${theme.hover} hover:shadow-sm`
          }`}
        >
          {getIcon(category.icon)}
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;