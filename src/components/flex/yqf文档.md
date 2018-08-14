原因：
ant flex组件自带TouchableWithoutFeedback

bug：
用TouchableOpacity或ouchableHighlight 抱住 felx 会出现无法点击事件。




官网对TouchableWithoutFeedback 描述
除非你有一个很好的理由，否则不要用这个组件。所有能够响应触屏操作的元素在触屏后都应该有一个视觉上的反馈（然而本组件没有任何视觉反馈）。这也是为什么一个"web"应用总是显得不够"原生"的主要原因之一。

注意：TouchableWithoutFeedback只支持一个子节点
如果你希望包含多个子组件，用一个View来包装它们。


