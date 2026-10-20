import type { Method } from '../types/cube';
import { buildStep } from '../engine/setupBuilder';

export const layerByLayerMethod: Method = {
  id: 'layer-by-layer',
  name: '层先法（LBL）',
  description: '最适合初学者的入门方法，通过逐层还原魔方（白底黄顶），简单易学。共约8条公式。',
  difficulty: 'beginner',
  steps: [],
  stepGroups: [
    {
      id: 1,
      title: '第一步：底层白十字',
      description: '白中心朝下(D)，黄中心朝上(U)。先把4个白棱转到U层拼成"白花"，再翻到底层做十字。',
      tips: '无公式，靠直觉摆放。做完后底面出现白十字，且4条棱的侧面色与相邻中心块一一对应。',
      steps: [
        {
          id: 1,
          title: '白棱在顶层（白色朝上）',
          description: '白色棱块在顶层，白色面朝上。直接F2翻到底层。',
          algorithm: "F2",
          tips: '将目标棱块放在前面，执行F2即可翻到底层正确位置。',
          ...buildStep("F2")
        },
        {
          id: 2,
          title: '白棱在顶层（白色朝侧面）',
          description: '白色棱块在顶层但白色朝侧面，需要对齐后翻转。',
          algorithm: "U' R' F R",
          tips: '先将白色面朝侧面，用U调整到合适位置后执行公式。',
          ...buildStep("U' R' F R")
        },
        {
          id: 3,
          title: '白棱在中层',
          description: '白色棱块卡在中间层，先移到顶层再翻到底层。',
          algorithm: "R U R'",
          tips: '棱块在右侧中层时使用，先移到顶层再处理。',
          ...buildStep("R U R'")
        }
      ]
    },
    {
      id: 2,
      title: '第二步：底层白角（完成第一层）',
      description: '白底朝下；把待归位的白角转到它应在的那个底角的正上方(U层)，然后执行公式。',
      tips: '做完后白角归位并翻正，白色底面+第一层侧面全部完成。',
      steps: [
        {
          id: 1,
          title: '角在右前上（R U R\' U\'）',
          description: '白角在右前上方，白色朝右或朝前。重复执行直到角块归位。',
          algorithm: "R U R' U'",
          tips: '角块在右前上位置时使用，通常执行2-3次即可归位。',
          ...buildStep("R U R' U'")
        },
        {
          id: 2,
          title: '角在左前上（L\' U\' L）',
          description: '白角在左前上方，白色朝左或朝前。左手镜像公式。',
          algorithm: "L' U' L",
          tips: '角块在左前上位置时使用，是上一个公式的右手镜像。',
          ...buildStep("L' U' L")
        },
        {
          id: 3,
          title: '角块白色朝上',
          description: '角块在目标位置正上方但白色朝上，需要先用公式调整方向。',
          algorithm: "R U2 R' U' R U R'",
          tips: '执行一次后白色会朝侧面，再用R U R\' U\'处理。',
          ...buildStep("R U2 R' U' R U R'")
        }
      ]
    },
    {
      id: 3,
      title: '第三步：中层棱（完成前两层）',
      description: '白底黄顶；在U层找不含黄色的棱，转动U层使其侧面色与正前方中心对齐，然后根据方向选择公式。',
      tips: '做完后中层棱归位，前两层完成（等效于Cross+F2L）。',
      steps: [
        {
          id: 1,
          title: '放入右侧',
          description: '棱块需要放入右侧中层槽位时使用。',
          algorithm: "U R U' R' U' F' U F",
          tips: '先将棱块顶面颜色对齐前面中心块，然后执行公式将棱块送入右侧。',
          ...buildStep("U R U' R' U' F' U F")
        },
        {
          id: 2,
          title: '放入左侧',
          description: '棱块需要放入左侧中层槽位时使用。',
          algorithm: "U' L' U L U F U' F'",
          tips: '先将棱块顶面颜色对齐前面中心块，然后执行公式将棱块送入左侧。',
          ...buildStep("U' L' U L U F U' F'")
        }
      ]
    },
    {
      id: 4,
      title: '第四步：顶层黄十字',
      description: '黄中心朝上(U)；只观察顶面黄色分布（不看侧面），根据情况执行公式。',
      tips: '点→L形→一字→十字是递进关系。任意方向做一次公式会进入下一个状态，再按对应摆放做即可。',
      steps: [
        {
          id: 1,
          title: '点 → L形/一字',
          description: '顶面只有中心是黄色（点状），任意方向执行一次公式变成L形或一字。',
          algorithm: "F R U R' U' F'",
          tips: '任意方向执行公式即可，黄色贴纸会从侧面翻上来。',
          ...buildStep("F R U R' U' F'")
        },
        {
          id: 2,
          title: 'L形 → 一字',
          description: '两个黄棱在左后方形成L形（两臂朝左后），执行后变成一字。',
          algorithm: "F R U R' U' F'",
          tips: '将L形两臂朝左后方摆放执行公式。',
          ...buildStep("F R U R' U' F'")
        },
        {
          id: 3,
          title: '一字 → 十字',
          description: '一字横放（左右方向），执行后完成黄十字。',
          algorithm: "F R U R' U' F'",
          tips: '一字横向放置执行公式，四个棱全部翻正形成黄十字。',
          ...buildStep("F R U R' U' F'")
        }
      ]
    },
    {
      id: 5,
      title: '第五步：顶面全黄（翻角）',
      description: '黄面朝上；根据角块黄色贴纸朝向判断使用哪个小鱼公式。',
      tips: '做完后顶面9格全部变黄（侧面暂不要求）。',
      steps: [
        {
          id: 1,
          title: '小鱼(右)：头朝左前',
          description: '鱼头（已翻正的角）朝左前方，其他角需要翻转。',
          algorithm: "R U R' U R U2 R'",
          tips: '将唯一的黄色角（鱼头）放在左前位置。',
          ...buildStep("R U R' U R U2 R'")
        },
        {
          id: 2,
          title: '小鱼(左)：头朝右前',
          description: '鱼头（已翻正的角）朝右前方，其他角需要翻转。',
          algorithm: "R U2 R' U' R U' R'",
          tips: '将唯一的黄色角（鱼头）放在右前位置。',
          ...buildStep("R U2 R' U' R U' R'")
        }
      ]
    },
    {
      id: 6,
      title: '第六步：顶层角归位',
      description: '黄面朝上；先找一个位置已正确的角（三色与相邻中心匹配），把它放在右前角。',
      tips: '做完后4个顶角回到正确位置（顶面保持全黄），只剩棱要调整。',
      steps: [
        {
          id: 1,
          title: '有一个角位置正确',
          description: '将已正确的角放右前方，交换其他三个角的位置。',
          algorithm: "R' F R' B2 R F' R' B2 R2",
          tips: '如果做完一次还没对齐，再做一次即可。',
          ...buildStep("R' F R' B2 R F' R' B2 R2")
        },
        {
          id: 2,
          title: '没有角位置正确',
          description: '任意方向执行一次公式，会出现一个位置正确的角。',
          algorithm: "R' F R' B2 R F' R' B2 R2",
          tips: '做完后用上一个公式继续处理。',
          ...buildStep("R' F R' B2 R F' R' B2 R2")
        }
      ]
    },
    {
      id: 7,
      title: '第七步：顶层棱归位',
      description: '黄面朝上；找一个已归位的棱放在后面(B)，然后根据方向执行三棱换公式。',
      tips: '四个棱都错时先任做一次三棱换，造出一条已归位的棱放到后面再做。',
      steps: [
        {
          id: 1,
          title: '顺时针三棱换',
          description: '已归位棱放后面，其他三棱顺时针交换。',
          algorithm: "R2 U R U R' U' R' U' R' U R'",
          tips: '将对齐的面放在背面(B)执行。',
          ...buildStep("R2 U R U R' U' R' U' R' U R'")
        },
        {
          id: 2,
          title: '逆时针三棱换',
          description: '已归位棱放后面，其他三棱逆时针交换。',
          algorithm: "R U' R U R U R U' R' U' R2",
          tips: '将对齐的面放在背面(B)执行。',
          ...buildStep("R U' R U R U R U' R' U' R2")
        }
      ]
    }
  ]
};
