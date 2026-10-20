import type { Method } from '../types/cube';
import { buildStep } from '../engine/setupBuilder';

export const rouxMethod: Method = {
  id: 'roux',
  name: '桥式（Roux）',
  description: '高效速拧方法，通过构建两个1x2x3桥、CMLL和LSE完成还原，步数更少（45~50步）。',
  difficulty: 'advanced',
  steps: [],
  stepGroups: [
    // ========== FB ==========
    {
      id: 1, title: '左桥（First Block）',
      description: '在左侧构建1x2x3块：先放DL棱，再围绕它配两组角棱。目标7~8步。无公式，全靠直觉。',
      tips: '自选底色（常见白或黄在L/D侧）。这两步没有公式，是Roux的核心难点也是低步数来源。',
      steps: [
        { id: 1, title: '基本左桥构建', description: '棱块和角块在顶层，直接配对放入底层左侧。', algorithm: "U' L' U L", tips: '将角块和棱块配对后放入左下位置。', ...buildStep("U' L' U L") },
        { id: 2, title: '角块在底层方向错误', description: '角块已在底层但方向不对，先取出再放入。', algorithm: "L U' L' U L U L'", tips: '先将角块取出到顶层，调整方向后重新放入。', ...buildStep("L U' L' U L U L'") },
        { id: 3, title: '棱块在中层', description: '棱块卡在中间层，先移到顶层。', algorithm: "L' U L U' L' U L", tips: '将中层棱块先顶到顶层再处理。', ...buildStep("L' U L U' L' U L") },
      ],
    },
    // ========== SB ==========
    {
      id: 2, title: '右桥（Second Block）',
      description: '在右侧构建对称的1x2x3块。可自由使用M层（不破坏左块）。无公式。',
      tips: '右桥构建时只用R和U层转动+M层，避免破坏左桥。',
      steps: [
        { id: 1, title: '基本右桥构建', description: '棱块和角块在顶层，配对后放入右下。', algorithm: "R U R' U' R U' R'", tips: '将角块和棱块配对后放入右下位置。', ...buildStep("R U R' U' R U' R'") },
        { id: 2, title: '角块白色朝上', description: '角块白色朝上，需调整方向。', algorithm: "R U2 R' U' R U R'", tips: '先U2调整，再用标准公式。', ...buildStep("R U2 R' U' R U R'") },
        { id: 3, title: '角块在底层方向错误', description: '角块在底层目标位置但方向错误。', algorithm: "R U R' U' R U R' U' R U R'", tips: '重复Sexy Move将角块取出并重新放入。', ...buildStep("R U R' U' R U R' U' R U R'") },
        { id: 4, title: '角棱已配对在顶层', description: '棱块和角块已正确配对，直接放入。', algorithm: "R U' R'", tips: '直接插入，最简单的右桥情况。', ...buildStep("R U' R'") },
      ],
    },
    // ========== CMLL 42条 ==========
    {
      id: 3, title: 'CMLL（角块·42条）',
      description: '两块已完成，只看U层4个角。顶层色(黄)朝上。效果：一次性完成4个角的朝向与位置。M层会被打乱属正常。',
      tips: '比CFOP的OLL+PLL更短，因为不需要保护M层。按8组分类：O(2)、H(4)、Pi(6)、U(6)、T(6)、S(6)、As(6)、L(6)。',
      steps: [
        // --- O 组 (2条) ---
        { id: 1, title: 'O-01 相邻换角', description: 'O组：相邻两角需交换。', algorithm: "(R U R') F' (R U R' U') R' F R2 U' R'", tips: '四角朝向+位置一次完成。', ...buildStep("(R U R') F' (R U R' U') R' F R2 U' R'") },
        { id: 2, title: 'O-02 对角换角', description: 'O组：对角两角需交换。', algorithm: "F R U' R' U' R U R' F' R U R' U' (R' F R F')", tips: '四角完成。', ...buildStep("F R U' R' U' R U R' F' R U R' U' (R' F R F')") },
        // --- H 组 (4条) ---
        { id: 3, title: 'H-01 列', description: 'H组。', algorithm: "(R U2 R' U') (R U R' U') R U' R'", tips: '四角完成。', ...buildStep("(R U2 R' U') (R U R' U') R U' R'") },
        { id: 4, title: 'H-02 行', description: 'H组。', algorithm: "F (R U R' U') (R U R' U') (R U R' U') F'", tips: '四角完成。', ...buildStep("F (R U R' U') (R U R' U') (R U R' U') F'") },
        { id: 5, title: 'H-03 列(变体)', description: 'H组变体。', algorithm: "R U2 (R2 F R F') U2 (R' F R F')", tips: '四角完成。', ...buildStep("R U2 (R2 F R F') U2 (R' F R F')") },
        { id: 6, title: 'H-04 行(变体)', description: 'H组变体。', algorithm: "r U' r2 D' r U' r' D r2 U r'", tips: '含D转动的r手法。', ...buildStep("r U' r2 D' r U' r' D r2 U r'") },
        // --- Pi 组 (6条) ---
        { id: 7, title: 'Pi-01 右bar', description: 'Pi组：右侧有bar。', algorithm: "F (R U R' U') (R U R' U') F'", tips: '四角完成。', ...buildStep("F (R U R' U') (R U R' U') F'") },
        { id: 8, title: 'Pi-02 反斜', description: 'Pi组：反斜线。', algorithm: "(F R' F' R) U2 R U' R' U R U2 R'", tips: '四角完成。', ...buildStep("(F R' F' R) U2 R U' R' U R U2 R'") },
        { id: 9, title: 'Pi-03 X棋盘', description: 'Pi组：X形。', algorithm: "R' F R U F U' (R U R' U') F'", tips: '四角完成。', ...buildStep("R' F R U F U' (R U R' U') F'") },
        { id: 10, title: 'Pi-04 正斜', description: 'Pi组：正斜线。', algorithm: "(R U2 R' U') (R U R' U2) (R' F R F')", tips: '四角完成。', ...buildStep("(R U2 R' U') (R U R' U2) (R' F R F')") },
        { id: 11, title: 'Pi-05 列', description: 'Pi组：列形。', algorithm: "r U' r2 D' r U r' D r2 U r'", tips: '含D的r手法。', ...buildStep("r U' r2 D' r U r' D r2 U r'") },
        { id: 12, title: 'Pi-06 左bar', description: 'Pi组：左侧有bar。', algorithm: "R' U' (R' F R F') R U' R' U2 R U", tips: '四角完成。', ...buildStep("R' U' (R' F R F') R U' R' U2 R U") },
        // --- U 组 (6条) ---
        { id: 13, title: 'U-01 正斜', description: 'U组。', algorithm: "R2 D R' U2 R D' R' U2 R'", tips: '含D转动。', ...buildStep("R2 D R' U2 R D' R' U2 R'") },
        { id: 14, title: 'U-02 反斜', description: 'U组。', algorithm: "R2 D' R U2 R' D R U2 R", tips: 'U-01镜像。', ...buildStep("R2 D' R U2 R' D R U2 R") },
        { id: 15, title: 'U-03 前行', description: 'U组。', algorithm: "R2 F U' F U F2 R2 U' R' F R", tips: '含F2的复合手法。', ...buildStep("R2 F U' F U F2 R2 U' R' F R") },
        { id: 16, title: 'U-04 行', description: 'U组。', algorithm: "F R2 D R' U R D' R2 U' F'", tips: '含D的手法。', ...buildStep("F R2 D R' U R D' R2 U' F'") },
        { id: 17, title: 'U-05 X棋盘', description: 'U组X形。', algorithm: "r U' r' U r' D' r U' r' D r", tips: '含D的r手法。', ...buildStep("r U' r' U r' D' r U' r' D r") },
        { id: 18, title: 'U-06 后行', description: 'U组。', algorithm: "F (R U R' U') F'", tips: '简洁的F手法。', ...buildStep("F (R U R' U') F'") },
        // --- T 组 (6条) ---
        { id: 19, title: 'T-01 左bar', description: 'T组：左侧bar。', algorithm: "(R U R' U') (R' F R F')", tips: '四角完成。', ...buildStep("(R U R' U') (R' F R F')") },
        { id: 20, title: 'T-02 右bar', description: 'T组：右侧bar。', algorithm: "(L' U' L U) (L F' L' F)", tips: '左手版本。', ...buildStep("(L' U' L U) (L F' L' F)") },
        { id: 21, title: 'T-03 行', description: 'T组：行形。', algorithm: "F R' F R2 U' R' U' R U R' F2", tips: '含R2和F2。', ...buildStep("F R' F R2 U' R' U' R U R' F2") },
        { id: 22, title: 'T-04 前行', description: 'T组：前行。', algorithm: "r' U r U2 (R2 F R F') R", tips: '含r和R2。', ...buildStep("r' U r U2 (R2 F R F') R") },
        { id: 23, title: 'T-05 后行', description: 'T组：后行。', algorithm: "r' D' r U r' D r U' r U r'", tips: '含D的r手法。', ...buildStep("r' D' r U r' D r U' r U r'") },
        { id: 24, title: 'T-06 列', description: 'T组：列形。', algorithm: "r2 D' r U r' D r2 U' r' U' r", tips: '含D的r2手法。', ...buildStep("r2 D' r U r' D r2 U' r' U' r") },
        // --- S 组 (6条) ---
        { id: 25, title: 'S-01 左bar', description: 'S组：左侧bar。', algorithm: "(R U R' U) R U2 R'", tips: 'Sune变体。', ...buildStep("(R U R' U) R U2 R'") },
        { id: 26, title: 'S-02 X棋盘', description: 'S组X形。', algorithm: "L' U2 L U2 (L F' L' F)", tips: '左手U2+右手F。', ...buildStep("L' U2 L U2 (L F' L' F)") },
        { id: 27, title: 'S-03 正斜', description: 'S组：正斜线。', algorithm: "F R' F' R U2 R U2 R'", tips: '含U2的手法。', ...buildStep("F R' F' R U2 R U2 R'") },
        { id: 28, title: 'S-04 列', description: 'S组：列形。', algorithm: "R' U' R U' R2 F' R U R U' R' F U2 R", tips: '较长的复合公式。', ...buildStep("R' U' R U' R2 F' R U R U' R' F U2 R") },
        { id: 29, title: 'S-05 右bar', description: 'S组：右侧bar。', algorithm: "(R U R' U) (R' F R F') R U2 R'", tips: 'Sexy Move+F手法。', ...buildStep("(R U R' U) (R' F R F') R U2 R'") },
        { id: 30, title: 'S-06 反斜', description: 'S组：反斜线。', algorithm: "R U' L' U R' U' L", tips: '含L的简洁公式。', ...buildStep("R U' L' U R' U' L") },
        // --- Anti-S 组 (6条) ---
        { id: 31, title: 'As-01 右bar', description: 'Anti-S组：右侧bar。', algorithm: "R' U' R U' R' U2 R", tips: 'Anti-Sune变体。', ...buildStep("R' U' R U' R' U2 R") },
        { id: 32, title: 'As-02 列', description: 'Anti-S组：列形。', algorithm: "R2 D R' U R D' R' U R' U' R U' R'", tips: '含D的复合手法。', ...buildStep("R2 D R' U R D' R' U R' U' R U' R'") },
        { id: 33, title: 'As-03 反斜', description: 'Anti-S组：反斜线。', algorithm: "(F' L F L') U2 L' U2 L", tips: '左手F+U2。', ...buildStep("(F' L F L') U2 L' U2 L") },
        { id: 34, title: 'As-04 X棋盘', description: 'Anti-S组X形。', algorithm: "R U2 R' U2 (R' F R F')", tips: 'U2+Sexy Move。', ...buildStep("R U2 R' U2 (R' F R F')") },
        { id: 35, title: 'As-05 正斜', description: 'Anti-S组：正斜线。', algorithm: "L' U R U' L U R'", tips: '含L的简洁公式。', ...buildStep("L' U R U' L U R'") },
        { id: 36, title: 'As-06 左bar', description: 'Anti-S组：左侧bar。', algorithm: "R' U' R U' R' U (R' F R F') U R", tips: 'Sexy Move+F+U。', ...buildStep("R' U' R U' R' U (R' F R F') U R") },
        // --- L 组 (6条) ---
        { id: 37, title: 'L-01 镜像', description: 'L组：镜像。', algorithm: "F R U' R' U' R U R' F'", tips: 'F+U\'手法。', ...buildStep("F R U' R' U' R U R' F'") },
        { id: 38, title: 'L-02 逆', description: 'L组：逆。', algorithm: "F R' F' R U R U' R'", tips: 'F+R手法。', ...buildStep("F R' F' R U R U' R'") },
        { id: 39, title: 'L-03 纯', description: 'L组：纯。', algorithm: "(R U2 R' U') (R U R' U') (R U R' U') R U' R'", tips: '连续Sexy Move变体。', ...buildStep("(R U2 R' U') (R U R' U') (R U R' U') R U' R'") },
        { id: 40, title: 'L-04 前交换子', description: 'L组：前交换子。', algorithm: "R U2 R D R' U2 R D' R2", tips: '含D的交换子。', ...buildStep("R U2 R D R' U2 R D' R2") },
        { id: 41, title: 'L-05 对角', description: 'L组：对角。', algorithm: "R' U' R U R' F' (R U R' U') R' F R2", tips: '复合手法。', ...buildStep("R' U' R U R' F' (R U R' U') R' F R2") },
        { id: 42, title: 'L-06 后交换子', description: 'L组：后交换子。', algorithm: "R' U2 R' D' R U2 R' D R2", tips: '含D的后交换子。', ...buildStep("R' U2 R' D' R U2 R' D R2") },
      ],
    },
    // ========== 2-Look CMLL ==========
    {
      id: 4, title: '2-Look CMLL（入门4条）',
      description: '不想一次背42条时的路线：先用这4条完成角的朝向和位置，再逐步补全套。',
      tips: 'Orient用Sune/Anti-Sune翻正四角，Permute用J-Perm/Y-Perm归位四角。',
      steps: [
        { id: 1, title: 'Orient: Sune', description: '先翻正四角（鱼头朝左后）。', algorithm: "R U R' U R U2 R'", tips: '唯一已翻正角放左后。', ...buildStep("R U R' U R U2 R'") },
        { id: 2, title: 'Orient: Anti-Sune', description: '先翻正四角（鱼头朝右前）。', algorithm: "R U2 R' U' R U' R'", tips: '唯一已翻正角放前右。', ...buildStep("R U2 R' U' R U' R'") },
        { id: 3, title: 'Permute: J-Perm(相邻换角)', description: '四角已翻正，相邻两角需交换。', algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'", tips: '已归位的车灯放后面。', ...buildStep("R U R' U' R' F R2 U' R' U' R U R' F'") },
        { id: 4, title: 'Permute: Y-Perm(对角换角)', description: '四角已翻正，对角两角需交换。', algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'", tips: '任意朝向即可。', ...buildStep("F R U' R' U' R U R' F' R U R' U' R' F R F'") },
      ],
    },
    // ========== LSE ==========
    {
      id: 5, title: 'LSE（最后6棱）',
      description: 'CMLL完成后，只用M层与U层转动，全程零旋转。分三小步：EO→UL/UR→M层归位。',
      tips: 'LSE主要使用M和U转动，是桥式最精巧的部分。4b/4c基本靠M2/U2组合直觉完成。',
      steps: [
        // --- EO (9条) ---
        { id: 1, title: 'EO-1 6棱全错', description: '6条棱朝向全部错误。', algorithm: "R U' r' U' M' U r U r'", tips: 'CMLL完成后，只用M层与U层转动。', ...buildStep("R U' r' U' M' U r U r'") },
        { id: 2, title: 'EO-2 2错(U层相邻)', description: 'U层相邻两条棱朝向错误。', algorithm: "M' U2 M' U2 M U' M'", tips: '将错误棱放在UF和UR位置。', ...buildStep("M' U2 M' U2 M U' M'") },
        { id: 3, title: 'EO-3 2错(U层相对)', description: 'U层相对两条棱朝向错误。', algorithm: "M' U M' U' M U' M'", tips: '将错误棱放在UF和UB位置。', ...buildStep("M' U M' U' M U' M'") },
        { id: 4, title: 'EO-4 2错(U+D层)', description: '一条在U层一条在D层。', algorithm: "M' U' M'", tips: '镜像：M U\' M\'。', ...buildStep("M' U' M'") },
        { id: 5, title: 'EO-5 4错(全在U层)', description: 'U层4条棱全错。', algorithm: "M' U2 M' U2 M' U' M'", tips: '四个U层棱朝向错误。', ...buildStep("M' U2 M' U2 M' U' M'") },
        { id: 6, title: 'EO-6 4错(U+D各2)', description: 'U层和D层各有2条棱朝向错误。', algorithm: "M' U M U' M' U' M'", tips: 'U和D层各有2个错误棱。', ...buildStep("M' U M U' M' U' M'") },
        { id: 7, title: 'EO-7 4错(3在U+DF)', description: 'U层3条+DF棱朝向错误。', algorithm: "M' U M' U2 M' U' M'", tips: '3个在U层+DF位置。', ...buildStep("M' U M' U2 M' U' M'") },
        { id: 8, title: 'EO-8 4错(3在U+DB)', description: 'U层3条+DB棱朝向错误。', algorithm: "M' U' M' U' M U' M'", tips: '3个在U层+DB位置。', ...buildStep("M' U' M' U' M U' M'") },
        { id: 9, title: 'EO-9 箭头(2错成箭头)', description: '两条棱形成箭头形。', algorithm: "M2 U' M' U' M'", tips: '箭头朝向错误。', ...buildStep("M2 U' M' U' M'") },
        // --- 4b: UL/UR 归位 ---
        { id: 10, title: '4b-1 UL/UR不在同层', description: 'UL和UR棱不在同一层，需先调整。', algorithm: "M' U2 M'", tips: '调U使两棱对角相对后执行。', ...buildStep("M' U2 M'") },
        { id: 11, title: '4b-2 UL/UR归位', description: 'UL和UR棱已在同层，送入D层后插入。', algorithm: "M2 U2 M2 U2", tips: 'M2把两棱送进D层，再调U后用M2插入。', ...buildStep("M2 U2 M2 U2") },
        // --- 4c: M层归位 ---
        { id: 12, title: '4c-1 M层已复原', description: 'M层4条棱已全部正确。', algorithm: "U", tips: '只需U层调整对齐即可，魔方复原。', ...buildStep("U") },
        { id: 13, title: '4c-2 M层对角双换', description: 'UF与UB互换、DF与DB互换。', algorithm: "M2", tips: '一步完成，魔方复原。', ...buildStep("M2") },
        { id: 14, title: '4c-3 M层三轮换(顺)', description: 'M层三条棱顺时针循环交换。', algorithm: "U2 M' U2 M'", tips: 'M层三棱循环归位，复原。', ...buildStep("U2 M' U2 M'") },
        { id: 15, title: '4c-4 M层三轮换(逆)', description: 'M层三条棱逆时针循环交换。', algorithm: "U2 M U2 M", tips: 'M层三棱循环归位，复原。', ...buildStep("U2 M U2 M") },
      ],
    },
  ],
};
