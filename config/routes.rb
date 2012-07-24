Wheatley::Application.routes.draw do
  get "home/index"

  resources :visitors do
    collection do
      get :signIn
      get :signOut
    end
  end
  
  resources :settings, :except => [:new, :edit, :update] do
    get :getSettings, :on => :collection
  end
  
  resource :design, :except => [:new, :edit, :update] do
    post :authorize
  end

	match 'whoisin' => 'visitors#whosin'
  match 'search' => 'visitors#searchBetweenDates'
  
  root :to => 'home#index'

  # CORS OPTIONS request
  match '*options', :controller => "application", :action => "options", :contstraints => {:method => 'OPTIONS'}
end
