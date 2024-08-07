interface ListItem {
  icon: string;
  label: string;
  active: boolean;
}

export async function changeActiveItem(
  selectedItem: ListItem,
  items: ListItem[]
) {
  items.forEach((item) => {
    item.active = item === selectedItem;
  });
}
