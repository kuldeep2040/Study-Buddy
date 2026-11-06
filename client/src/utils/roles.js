// Where each role "lives" in the app.
const HOME_BY_ROLE = {
  student: '/',
  supporter: '/supporter',
};

export function homePathFor(role) {
  return HOME_BY_ROLE[role] ?? '/login';
}
