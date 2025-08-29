import { IAccessStrategy, Action, Entity } from '../IAccessStrategy';
/**
 * ViewerStrategy class.
 * @class
 */
export class ViewerStrategy implements IAccessStrategy {
  can(action: Action, entity: Entity): boolean {
    if ((entity==='topic'||entity==='resource') && action==='read') return true;
    return false;
  }
}