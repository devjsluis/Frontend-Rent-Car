enum Status {
  Inactivo = 0,
  Activo = 1,
}

const getStatus = (status: number | string) => {
  switch (status) {
    case Status.Activo:
      return "Activo";
    case Status.Inactivo:
      return "Inactivo";
    default:
      return "Indefinido";
  }
};

export { getStatus };
