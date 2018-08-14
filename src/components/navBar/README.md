---
onlyBar     ----隐藏状态栏
 优先级 
 leftIcon > leftText  (不能同时显示)
 rightView > rightIcon >  rightText
---

  _rightView(){
    return 自定义
  }

    <NavBar  onlyBar
    leftText="返回"
    leftIcon={'0xe667'}  
    onLeftClick={() => console.log('onLeftClick')}
    title="主页"
    rightIcon={'0xe667'}  
    onRightClick={() => console.log('onLeftClick')}
    rightView={
      this._rightView()
      }
    >NavBar</NavBar>


