import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Member } from "../types/add-member";
import type {
  MemberProduct,
  MemberProductFormValues,
} from "../types/member-products";
import {
  MEMBERS_UPDATED_EVENT,
  loadMembersFromStorage,
} from "../utils/member-storage";
import { findMemberBySlug } from "../utils/member-path";
import {
  MEMBER_PRODUCTS_UPDATED_EVENT,
  createProductFromForm,
  loadMemberProductsFromStorage,
  saveMemberProductsToStorage,
} from "../utils/member-product-storage";

const defaultFormState: MemberProductFormValues = {
  name: "",
  url: "",
  price: "",
  notes: "",
};

const MemberProducts = () => {
  const { memberSlug } = useParams<{ memberSlug: string }>();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>(loadMembersFromStorage);
  const [products, setProducts] = useState<MemberProduct[]>(
    loadMemberProductsFromStorage
  );
  const [formState, setFormState] = useState<MemberProductFormValues>(() => ({
    ...defaultFormState,
  }));
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setMembers(loadMembersFromStorage());
    };
    window.addEventListener(MEMBERS_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(MEMBERS_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  useEffect(() => {
    const handleProductsUpdate = () => {
      setProducts(loadMemberProductsFromStorage());
    };
    window.addEventListener(
      MEMBER_PRODUCTS_UPDATED_EVENT,
      handleProductsUpdate
    );
    return () => {
      window.removeEventListener(
        MEMBER_PRODUCTS_UPDATED_EVENT,
        handleProductsUpdate
      );
    };
  }, []);

  const member = useMemo(() => {
    if (!memberSlug) {
      return undefined;
    }
    try {
      return findMemberBySlug(members, decodeURIComponent(memberSlug));
    } catch {
      return undefined;
    }
  }, [memberSlug, members]);

  const memberProducts = useMemo(() => {
    if (!member) {
      return [];
    }
    return products
      .filter((product) => product.memberId === member.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [products, member]);

  const totalTrackedValue = useMemo(() => {
    if (!memberProducts.length) {
      return null;
    }
    const sum = memberProducts.reduce((acc, product) => {
      if (typeof product.priceValue === "number") {
        return acc + product.priceValue;
      }
      return acc;
    }, 0);
    return Number.isFinite(sum) ? sum : null;
  }, [memberProducts]);

  const handleFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!member) {
      setFormError("Member not found. Return to the members list.");
      return;
    }
    if (!formState.name.trim()) {
      setFormError("Give the product a name before saving it.");
      return;
    }

    const newProduct = createProductFromForm(member.id, formState);

    setProducts((prev) => {
      const next = [...prev, newProduct];
      saveMemberProductsToStorage(next);
      return next;
    });

    setFormState({ ...defaultFormState });
  };

  const handleDelete = (productId: string) => {
    setProducts((prev) => {
      const next = prev.filter((product) => product.id !== productId);
      saveMemberProductsToStorage(next);
      return next;
    });
  };

  if (!memberSlug || !member) {
    return (
      <div className="flex min-h-[calc(100dvh-6rem)] flex-col items-center justify-center gap-4 text-contrast">
        <p className="text-lg font-semibold">Member not found.</p>
        <button
          type="button"
          onClick={() => navigate("/Members")}
          className="rounded-lg border border-brand/70 bg-brand px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand/70 focus:ring-offset-2 focus:ring-offset-primary"
        >
          Back to Members
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 text-contrast">
      <button
        type="button"
        onClick={() => navigate("/Members")}
        className="self-start rounded-full border border-brand/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-brand shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand/70 focus:ring-offset-2 focus:ring-offset-primary"
      >
        Members
      </button>

      <section className="space-y-4 rounded-3xl border border-accent-2/60 bg-primary/80 p-6 shadow-lg shadow-slate-800/10 backdrop-blur">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-contrast">
              {member.name}
            </h1>
            {member.connection ? (
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.35em] text-brand">
                {member.connection}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1 text-sm text-contrast/75">
            <span>
              Tracked products:{" "}
              <strong className="text-brand">{memberProducts.length}</strong>
            </span>
            {totalTrackedValue != null ? (
              <span>
                Estimated value:{" "}
                <strong className="text-brand">
                  {totalTrackedValue.toFixed(2)}
                </strong>
              </span>
            ) : null}
          </div>
        </header>
        <p className="text-sm text-contrast/70">
          Keep a shortlist of gift ideas tied to this member. Save links, price
          expectations, and quick notes about why they&apos;d love it.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-accent-2/60 bg-primary/65 p-6 shadow-md shadow-slate-800/10 backdrop-blur">
        <header>
          <h2 className="text-lg font-semibold text-brand">Add a product</h2>
          <p className="text-sm text-contrast/60">
            Only the product name is required. Everything else is optional so
            you can capture ideas quickly.
          </p>
        </header>
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 sm:grid-cols-2 sm:gap-6"
        >
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.3em] text-contrast/80 sm:col-span-2">
            Product name
            <input
              name="name"
              value={formState.name}
              onChange={handleFieldChange}
              placeholder="e.g. Cozy knit sweater"
              className="rounded-lg border border-accent-2/50 bg-primary px-3 py-2 text-sm text-contrast shadow-sm focus:border-brand/70 focus:outline-none focus:ring-2 focus:ring-brand/50"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.3em] text-contrast/80">
            Link
            <input
              name="url"
              value={formState.url}
              onChange={handleFieldChange}
              placeholder="https://example.com/product"
              className="rounded-lg border border-accent-2/50 bg-primary px-3 py-2 text-sm text-contrast shadow-sm focus:border-brand/70 focus:outline-none focus:ring-2 focus:ring-brand/50"
              type="url"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.3em] text-contrast/80">
            Target price
            <input
              name="price"
              value={formState.price}
              onChange={handleFieldChange}
              placeholder="e.g. 49.99"
              className="rounded-lg border border-accent-2/50 bg-primary px-3 py-2 text-sm text-contrast shadow-sm focus:border-brand/70 focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.3em] text-contrast/80 sm:col-span-2">
            Notes
            <textarea
              name="notes"
              value={formState.notes}
              onChange={handleFieldChange}
              placeholder="Gift timing, retailer options, sizing tips..."
              rows={3}
              className="rounded-lg border border-accent-2/50 bg-primary px-3 py-2 text-sm text-contrast shadow-sm focus:border-brand/70 focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </label>
          {formError ? (
            <p className="sm:col-span-2 text-sm text-amber-400">{formError}</p>
          ) : null}
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="rounded-xl border border-brand/70 bg-brand px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand/70 focus:ring-offset-2 focus:ring-offset-primary"
            >
              Save product
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4 rounded-3xl border border-accent-2/60 bg-primary/65 p-6 shadow-md shadow-slate-800/5 backdrop-blur">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-brand">
              Tracked products
            </h2>
            <p className="text-sm text-contrast/60">
              {memberProducts.length > 0
                ? "Review and maintain their wishlist here."
                : "No products yet. Add your first idea above."}
            </p>
          </div>
        </header>
        <div className="space-y-4">
          {memberProducts.length === 0 ? (
            <p className="text-sm text-contrast/60">
              You haven&apos;t saved any products for {member.name} yet.
            </p>
          ) : (
            memberProducts.map((product) => (
              <article
                key={product.id}
                className="flex flex-col gap-3 rounded-2xl border border-accent-2/40 bg-primary/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-contrast">
                    {product.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-contrast/60">
                    <span>
                      Added{" "}
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                    {product.priceDisplay ? (
                      <span className="rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-[0.65rem] font-semibold text-brand">
                        {product.priceDisplay}
                      </span>
                    ) : null}
                  </div>
                  {product.notes ? (
                    <p className="text-sm text-contrast/70">{product.notes}</p>
                  ) : null}
                  {product.url ? (
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-brand underline-offset-4 hover:underline"
                    >
                      View product
                    </a>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(product.id)}
                  className="self-start rounded-full border border-accent-2/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-contrast shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand/70 focus:ring-offset-2 focus:ring-offset-primary"
                >
                  Remove
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default MemberProducts;
