<script setup lang="ts">
import { navigationMenuTriggerStyle } from "../ui/navigation-menu";

defineProps<{
  links: Link[];
}>();

const [DefineNavigationMenu, ReuseNavigationMenu] = createReusableTemplate();
</script>

<template>
  <DefineNavigationMenu>
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem v-for="{ name, to } in links" :key="to">
          <NuxtLink :class="navigationMenuTriggerStyle()" :to="to" class="bg-premier text-premier-foreground">
            {{ name }}
          </NuxtLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  </DefineNavigationMenu>
  <header class="fixed top-0 left-0 w-full py-3 bg-premier border-b z-50">
    <nav
      class="flex justify-between [&>div]:flex [&>div]:items-center [&>div]:gap-3 px-4"
    >
      <div>
        <LayoutLogo />
        <ReuseNavigationMenu class="hidden md:flex" />
      </div>
      <div>
        <slot />
        <!-- <Sheet>
          <SheetTrigger class="flex md:hidden" as-child>
            <Button variant="outline" size="icon" aria-label="Header Menu">
              <Icon name="lucide:menu" size="20" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <ReuseNavigationMenu class="[&_ul]:flex-col [&_ul]:items-start" />
          </SheetContent>
        </Sheet> -->
      </div>
    </nav>
  </header>
</template>
