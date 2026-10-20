import { Link } from 'wouter';
import { Box, Zap, Target, BookOpen } from 'lucide-react';

export default function HomePage() {
  const methods = [
    {
      id: 'layer-by-layer',
      name: '层先法',
      description: '最适合初学者的入门方法，通过逐层还原魔方，简单易学。',
      difficulty: '入门',
      color: 'bg-green-500',
      icon: BookOpen,
    },
    {
      id: 'cfop',
      name: 'CFOP',
      description: '最主流的速拧方法，通过Cross、F2L、OLL、PLL四个步骤快速还原。',
      difficulty: '进阶',
      color: 'bg-blue-500',
      icon: Zap,
    },
    {
      id: 'roux',
      name: '桥式（Roux）',
      description: '高效的速拧方法，通过构建两个桥、CMLL和LSE完成还原，步数更少。',
      difficulty: '高级',
      color: 'bg-purple-500',
      icon: Target,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Box className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">魔方教学</h1>
          </div>
          <Link href="/play" className="text-blue-600 hover:text-blue-800 font-medium">
            自由练习
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              学习三阶魔方还原
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              选择适合你的还原方法，从入门到精通，一步步掌握魔方还原技巧。
              配合3D可视化演示，让学习更加直观高效。
            </p>
          </div>
        </div>
      </div>

      {/* Methods Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {methods.map((method) => {
            const Icon = method.icon;
            return (
              <Link key={method.id} href={`/learn/${method.id}`}>
                <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer h-full">
                  <div className={`${method.color} h-2`} />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`${method.color} p-2 rounded-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{method.name}</h3>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {method.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{method.description}</p>
                    <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                      开始学习
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <Box className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3D可视化</h3>
              <p className="text-sm text-gray-600">实时3D魔方演示，支持旋转观看，让每一步操作清晰可见。</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">分步教学</h3>
              <p className="text-sm text-gray-600">详细的步骤说明和公式演示，从入门到精通逐步掌握。</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">自由练习</h3>
              <p className="text-sm text-gray-600">提供自由练习模式，随时练习和探索魔方操作。</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
          魔方教学 - 让魔方还原变得简单有趣
        </div>
      </footer>
    </div>
  );
}
