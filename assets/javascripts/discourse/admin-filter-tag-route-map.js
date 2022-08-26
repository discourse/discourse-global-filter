export default {
  resource: "admin.adminPlugins",
  path: "/plugins",
  map() {
    this.route("filter_tag");
  },
};
