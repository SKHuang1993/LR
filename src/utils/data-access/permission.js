import Enumerable from 'linq'

export class PermissionInfo {
    //对应的操作权限
    static hasPermission = (permissions, sysKey) => {
        try {
            return Enumerable.from(permissions).firstOrDefault(o => o.SysKey == sysKey, null);
        } catch (err) {
            console.log(err);
            return false;
        }
    }
}