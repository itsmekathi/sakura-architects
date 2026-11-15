import type { Access, FieldAccess, PayloadRequest } from 'payload'

/**
 * Two kinds of signed-in user exist:
 *  - staff   → `users` collection (admin panel)
 *  - visitor → `visitors` collection (public site accounts)
 * Never test `Boolean(req.user)` for staff permissions: a visitor is a user too.
 */
export const isStaffUser = (user: PayloadRequest['user']) => user?.collection === 'users'
export const isVisitorUser = (user: PayloadRequest['user']) => user?.collection === 'visitors'

export const anyone: Access = () => true

/** Staff only (any role). */
export const isStaff: Access = ({ req: { user } }) => isStaffUser(user)
/** @deprecated use isStaff. Kept so older imports keep meaning "staff". */
export const authenticated = isStaff

export const isStaffField: FieldAccess = ({ req: { user } }) => isStaffUser(user)

export const isAdmin: Access = ({ req: { user } }) => isStaffUser(user) && user?.role === 'admin'

export const isAdminField: FieldAccess = ({ req: { user } }) =>
  isStaffUser(user) && user?.role === 'admin'

/** Staff admins see all staff users; staff editors see only themselves. */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!isStaffUser(user)) return false
  if (user?.role === 'admin') return true
  return { id: { equals: user!.id } }
}

/** Staff see everything; a visitor sees only their own visitor record. */
export const isStaffOrSelfVisitor: Access = ({ req: { user } }) => {
  if (isStaffUser(user)) return true
  if (isVisitorUser(user)) return { id: { equals: user!.id } }
  return false
}
