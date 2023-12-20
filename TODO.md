Shopping articles:
- MyShopCartArticles
  - Show unpaid sum
  - Show refunded sum

Also to design/do:
- A way to view the articles paid for us
- A way to set the articles paid for us as refunded

List of refactors:
- Subcommands for shop cart (add / edit / remove) shop cart article
- Subcommands for shop cart (new / edit / delete) cart

Bully / Karma design:
Example:
Karma(X) = SUM(MEMBER => 1/(|MEMBERS| - 1) * MIN(-50, MAX(SUM(VOTES => MEMBER NOT X), 50))) * (1 / 100) + (1 / 2)
So, Karma(X) is in the range [0, 1].

isolate libraries in the long term