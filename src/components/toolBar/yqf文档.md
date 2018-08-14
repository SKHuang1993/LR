---
itemColor={'#fff'} 子元素颜色   
 stateColor={'#fff'} 状态颜色 
  activeTab={1} 设定当前状态  第一个0 第二个1
  style 为toolbar style (一般设置背景颜色和高度)
---

##
export default class demo extends Component {
  render() {
    return <ToolBar  itemColor={'red'} stateColor={'red'} activeTab={1} style={{backgroundColor:'green'}}
      actions={
        [
          { title: '筛选', icon: '0xe675', onPress: () => alert(1) },
          { title: '从早到晚', icon: '0xe670', onPress: () => 1 },
        ]
      }
    />

  }
}

 