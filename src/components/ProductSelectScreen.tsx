import React from 'react';
import { Product } from '../types';
import { soundEffects } from '../utils/audioEffects';

interface ProductSelectScreenProps {
  products: Product[];
  onSelectProduct: (productId: string) => void;
  employeeName: string;
}

export const ProductSelectScreen: React.FC<ProductSelectScreenProps> = ({ products, onSelectProduct, employeeName }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 min-h-0 overflow-y-auto w-full px-4">
      <div className="w-full max-w-md md:max-w-3xl pt-12 pb-8 animate-fadeIn">
        
        {/* Title Area */}
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {employeeName} 님,<br/>어떤 제품을 디테일할까요?
          </h1>
          <p className="text-sm text-slate-500 font-medium">원하시는 제품을 선택해주세요</p>
        </div>

        {/* Product List */}
        <div className="space-y-4 md:grid md:grid-cols-2 md:gap-5 md:space-y-0">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => {
                soundEffects.playClick();
                onSelectProduct(product.id);
              }}
              className="w-full bg-white rounded-3xl p-5 md:p-6 flex items-center gap-5 md:gap-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] active:scale-[0.98] transition-all border border-slate-100 group"
            >
              {/* Product Image */}
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center p-2 border border-slate-100">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                ) : (
                  <span className="text-2xl">{product.icon}</span>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
                <p className="text-xs text-slate-400 font-medium mt-1 truncate">{product.composition}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
