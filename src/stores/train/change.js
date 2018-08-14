import {observable} from 'mobx'

let index = 0

class ChangeListStore {
  @observable list = [];
  @observable isSure = false;
  @observable orderDetail = {};
  @observable count = 0;
  @observable changeOrReturn = 1;//1表示改签,2表示退票
  @observable departureTime = '';
  @observable ticketPrice = 0.0;
  @observable poundage = 0.0

  addListItem (item) {
    this.list.push({
      items: item,
      isSelect:false,
    })
  }

  toSelect = (index) =>{
      this.list[index].isSelect = !this.list[index].isSelect;
      if(this.list[index].isSelect) this.count++;
      else this.count--;
  }
}


const changeListStore = new ChangeListStore()
export default changeListStore