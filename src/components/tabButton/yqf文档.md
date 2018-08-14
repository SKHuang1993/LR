---
必填
tabNames={['因公', '因私']}   

选填（） -----   ActiveStyle 为当前状态样式
textActiveStyle --当前状态 文本
textStyle --文本
tabStyle  --本文的祖级
tabActiveStyle
tabItemStyle  --本文的父级 --可以设定文本的下划线
tabItemActiveStyle
activeTab
onClink  点击事件
---

##
<TabButton style={styles.switch}
                tabNames={['因公', '因私']}
                textActiveStyle={styles.switch_txt_acitve}
                textStyle={styles.switch_txt}
                tabStyle={styles.switch_tab}
                tabActiveStyle={styles.switch_tabActive}
                activeTab={1} onClink={(i) => 1} />

 