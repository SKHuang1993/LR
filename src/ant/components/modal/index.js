import Modal from './Modal';
import alert from './alert';
Modal.alert = alert;
Modal.prompt = () => {
    console.warn('Modal.prompt is on the road, use react native "AlertIOS" temporarily');
};
export default Modal;
