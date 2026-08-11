function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Revisá tu .env o los secrets del workflow.`);
  }
  return value;
}

const teacherCredentials = {
  username: requireEnv('ALIZIA_TEACHER_EMAIL'),
  password: requireEnv('ALIZIA_TEACHER_PASSWORD'),
};

const users = {
  admin: {
    username: requireEnv('ALIZIA_ADMIN_EMAIL'),
    password: requireEnv('ALIZIA_ADMIN_PASSWORD'),
  },
  teacher: teacherCredentials,
  teacher2: teacherCredentials,
};

export default users;
