import {observable} from 'mobx'

let index = 0

class PassengerOrderDetail {
  @observable passengerList = [];

  addListItem (item) {
    // this.passengerList.push(item)
    this.passengerList.splice(this.passengerList.length,0,item);
  }
}


const passengerOrderDetail = new PassengerOrderDetail()
export default passengerOrderDetail