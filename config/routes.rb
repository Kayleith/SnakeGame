Rails.application.routes.draw do
  resources :high_scores
  root to: "root#root"
end
