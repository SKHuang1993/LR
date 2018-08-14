---
原因：  
1.renderHeader  不能设置样式 
2.extra 右边内容父级限死样式
---

##  父级 已添加 子类 renderHeaderStyle 样式 
## 
   <List renderHeader={()  => '左侧无icon'} renderHeaderStyle={{backgroundColor:'#fff'}} ></List>
 
 ### List.Item 94行 修改

| 成员        | 说明           | 类型       | 默认值       |
|------------|----------------|----------------|
| extra      | 右边内容        | React.Element |  无  |

extraDom = (<View style={[styles.column]}>{extra.props.children}</View>); 修改前
extraDom = extra.props.children; 修改后


###新增 check 多选单选
| 成员        | 说明           | 类型       | 默认值       |
|------------|----------------|----------------|
| check      | 多选单选        |     布尔值      |  false  |
