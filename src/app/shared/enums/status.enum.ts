enum Status {
  Activo = 1,
  Inactivo = 0,
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
